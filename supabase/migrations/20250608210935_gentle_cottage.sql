/*
  # Fan Store Access Migration

  1. Purpose
    - Enable fans to view and purchase music from all artists
    - Create a public storefront for published music
    - Ensure proper RLS policies for public access

  2. Changes
    - Add 'published' boolean column to tracks and releases
    - Create public access policies for published content
    - Add store_view function to simplify queries

  3. Security
    - Maintain workspace-based security for unpublished content
    - Allow public read-only access to published content
    - Ensure purchase records are properly secured
*/

-- Add published flag to tracks if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tracks' AND column_name = 'published'
  ) THEN
    ALTER TABLE tracks ADD COLUMN published boolean DEFAULT false;
  END IF;
END $$;

-- Add published flag to releases if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'releases' AND column_name = 'published'
  ) THEN
    ALTER TABLE releases ADD COLUMN published boolean DEFAULT false;
  END IF;
END $$;

-- Add published flag to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'published'
  ) THEN
    ALTER TABLE products ADD COLUMN published boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracks_published ON tracks(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_releases_published ON releases(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published) WHERE published = true;

-- Create or replace public access policies for tracks
DO $$
BEGIN
  -- Drop existing policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tracks' AND policyname = 'tracks_public_read'
  ) THEN
    DROP POLICY tracks_public_read ON tracks;
  END IF;

  -- Create new policy
  CREATE POLICY "tracks_public_read" ON tracks
    FOR SELECT
    USING (published = true AND status = 'ready');
END $$;

-- Create or replace public access policies for releases
DO $$
BEGIN
  -- Drop existing policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'releases' AND policyname = 'releases_public_read'
  ) THEN
    DROP POLICY releases_public_read ON releases;
  END IF;

  -- Create new policy
  CREATE POLICY "releases_public_read" ON releases
    FOR SELECT
    USING (published = true);
END $$;

-- Create or replace public access policies for products
DO $$
BEGIN
  -- Drop existing policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' AND policyname = 'products_public_read'
  ) THEN
    DROP POLICY products_public_read ON products;
  END IF;

  -- Create new policy
  CREATE POLICY "products_public_read" ON products
    FOR SELECT
    USING (published = true AND active = true);
END $$;

-- Create function to get store view of all published content
CREATE OR REPLACE FUNCTION get_store_content(
  content_type text DEFAULT NULL,
  limit_param integer DEFAULT 100,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  type text,
  cover_url text,
  price numeric,
  release_date timestamptz,
  workspace_id uuid
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM releases r 
       JOIN release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    COALESCE(
      (SELECT p.price FROM products p
       WHERE p.metadata->>'track_id' = t.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    t.created_at as release_date,
    t.workspace_id
  FROM tracks t
  WHERE 
    t.published = true 
    AND t.status = 'ready'
    AND (content_type IS NULL OR content_type = 'track')
  
  UNION ALL
  
  SELECT 
    r.id,
    r.title,
    r.artist,
    'release' as type,
    COALESCE(r.artwork_url, 'default-release-cover.jpg') as cover_url,
    COALESCE(
      (SELECT p.price FROM products p
       WHERE p.metadata->>'release_id' = r.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
    r.workspace_id
  FROM releases r
  WHERE 
    r.published = true
    AND (content_type IS NULL OR content_type = 'release')
  
  ORDER BY release_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Create function to search store content
CREATE OR REPLACE FUNCTION search_store_content(
  search_term text,
  limit_param integer DEFAULT 100,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  type text,
  cover_url text,
  price numeric,
  release_date timestamptz,
  workspace_id uuid,
  relevance float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM releases r 
       JOIN release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    COALESCE(
      (SELECT p.price FROM products p
       WHERE p.metadata->>'track_id' = t.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    t.created_at as release_date,
    t.workspace_id,
    ts_rank(
      to_tsvector('english', t.title || ' ' || t.artist || ' ' || COALESCE(t.metadata->>'genre', '')),
      plainto_tsquery('english', search_term)
    ) as relevance
  FROM tracks t
  WHERE 
    t.published = true 
    AND t.status = 'ready'
    AND (
      t.title ILIKE '%' || search_term || '%'
      OR t.artist ILIKE '%' || search_term || '%'
      OR t.metadata->>'genre' ILIKE '%' || search_term || '%'
    )
  
  UNION ALL
  
  SELECT 
    r.id,
    r.title,
    r.artist,
    'release' as type,
    COALESCE(r.artwork_url, 'default-release-cover.jpg') as cover_url,
    COALESCE(
      (SELECT p.price FROM products p
       WHERE p.metadata->>'release_id' = r.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
    r.workspace_id,
    ts_rank(
      to_tsvector('english', r.title || ' ' || r.artist || ' ' || COALESCE(r.metadata->>'genre', '')),
      plainto_tsquery('english', search_term)
    ) as relevance
  FROM releases r
  WHERE 
    r.published = true
    AND (
      r.title ILIKE '%' || search_term || '%'
      OR r.artist ILIKE '%' || search_term || '%'
      OR r.metadata->>'genre' ILIKE '%' || search_term || '%'
    )
  
  ORDER BY relevance DESC, release_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Create function to get artist store page
CREATE OR REPLACE FUNCTION get_artist_store(
  artist_handle text,
  limit_param integer DEFAULT 100,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  type text,
  cover_url text,
  price numeric,
  release_date timestamptz,
  workspace_id uuid
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  artist_workspace_id uuid;
BEGIN
  -- Get the workspace ID for the artist
  SELECT workspace_id INTO artist_workspace_id
  FROM profiles
  WHERE handle = artist_handle AND role = 'ARTIST';
  
  -- Return empty set if artist not found
  IF artist_workspace_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM releases r 
       JOIN release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    COALESCE(
      (SELECT p.price FROM products p
       WHERE p.metadata->>'track_id' = t.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    t.created_at as release_date,
    t.workspace_id
  FROM tracks t
  WHERE 
    t.published = true 
    AND t.status = 'ready'
    AND t.workspace_id = artist_workspace_id
  
  UNION ALL
  
  SELECT 
    r.id,
    r.title,
    r.artist,
    'release' as type,
    COALESCE(r.artwork_url, 'default-release-cover.jpg') as cover_url,
    COALESCE(
      (SELECT p.price FROM products p
       WHERE p.metadata->>'release_id' = r.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
    r.workspace_id
  FROM releases r
  WHERE 
    r.published = true
    AND r.workspace_id = artist_workspace_id
  
  ORDER BY release_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Create function to get featured content for store homepage
CREATE OR REPLACE FUNCTION get_featured_store_content(
  limit_param integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  type text,
  cover_url text,
  price numeric,
  release_date timestamptz,
  workspace_id uuid,
  featured_position integer
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- This would typically use some algorithm to determine featured content
  -- For now, we'll just return the most recent published content
  RETURN QUERY
  WITH featured AS (
    SELECT 
      t.id,
      t.title,
      t.artist,
      'track' as type,
      COALESCE(
        (SELECT r.artwork_url FROM releases r 
         JOIN release_tracks rt ON r.id = rt.release_id 
         WHERE rt.track_id = t.id
         LIMIT 1),
        'default-track-cover.jpg'
      ) as cover_url,
      COALESCE(
        (SELECT p.price FROM products p
         WHERE p.metadata->>'track_id' = t.id::text
         AND p.published = true
         AND p.active = true
         LIMIT 1),
        0
      ) as price,
      t.created_at as release_date,
      t.workspace_id,
      ROW_NUMBER() OVER (ORDER BY t.created_at DESC) as featured_position
    FROM tracks t
    WHERE 
      t.published = true 
      AND t.status = 'ready'
    
    UNION ALL
    
    SELECT 
      r.id,
      r.title,
      r.artist,
      'release' as type,
      COALESCE(r.artwork_url, 'default-release-cover.jpg') as cover_url,
      COALESCE(
        (SELECT p.price FROM products p
         WHERE p.metadata->>'release_id' = r.id::text
         AND p.published = true
         AND p.active = true
         LIMIT 1),
        0
      ) as price,
      COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
      r.workspace_id,
      ROW_NUMBER() OVER (ORDER BY COALESCE(r.release_date::timestamptz, r.created_at) DESC) as featured_position
    FROM releases r
    WHERE 
      r.published = true
  )
  SELECT * FROM featured
  WHERE featured_position <= limit_param
  ORDER BY featured_position;
END;
$$;

-- Create function to check if user has purchased a track/release
CREATE OR REPLACE FUNCTION has_purchased(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_lines ol ON o.id = ol.order_id
    JOIN products p ON ol.product_id = p.id
    WHERE 
      -- Match the user who made the purchase
      o.customer_email = (SELECT email FROM users WHERE id = user_id_param)
      -- Order is completed
      AND o.status IN ('shipped', 'delivered')
      -- Match the content ID in the product metadata
      AND (
        (content_type_param = 'track' AND p.metadata->>'track_id' = content_id_param::text)
        OR
        (content_type_param = 'release' AND p.metadata->>'release_id' = content_id_param::text)
      )
  );
END;
$$;

-- Create function to get user's purchased content
CREATE OR REPLACE FUNCTION get_user_purchases(
  user_id_param uuid,
  limit_param integer DEFAULT 100,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  type text,
  cover_url text,
  purchase_date timestamptz,
  order_id uuid
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH user_orders AS (
    SELECT o.id as order_id, o.created_at as purchase_date
    FROM orders o
    WHERE 
      o.customer_email = (SELECT email FROM users WHERE id = user_id_param)
      AND o.status IN ('shipped', 'delivered')
  )
  
  -- Get purchased tracks
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM releases r 
       JOIN release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    uo.purchase_date,
    uo.order_id
  FROM tracks t
  JOIN products p ON p.metadata->>'track_id' = t.id::text
  JOIN order_lines ol ON ol.product_id = p.id
  JOIN user_orders uo ON uo.order_id = ol.order_id
  
  UNION ALL
  
  -- Get purchased releases
  SELECT 
    r.id,
    r.title,
    r.artist,
    'release' as type,
    COALESCE(r.artwork_url, 'default-release-cover.jpg') as cover_url,
    uo.purchase_date,
    uo.order_id
  FROM releases r
  JOIN products p ON p.metadata->>'release_id' = r.id::text
  JOIN order_lines ol ON ol.product_id = p.id
  JOIN user_orders uo ON uo.order_id = ol.order_id
  
  ORDER BY purchase_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Add feature flag for store
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, target_roles)
VALUES 
  ('STORE_ENABLED', 'Enable music store for fans', true, 100, NULL)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  target_roles = EXCLUDED.target_roles,
  updated_at = now();
/*
  # Fan Library System

  1. New Tables
    - `user_library` - Junction table for users and their purchased content
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content_id` (uuid) - ID of track or release
      - `content_type` (text) - 'track' or 'release'
      - `purchase_date` (timestamptz)
      - `order_id` (uuid, references orders)
      - `play_count` (integer)
      - `last_played` (timestamptz)
      - `is_favorite` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on user_library table
    - Add policies for users to read their own library
    - Add function to add items to library on purchase

  3. Functions
    - Create function to get user's library
    - Create function to update play count
    - Create function to toggle favorite status
*/

-- Create user_library table
CREATE TABLE IF NOT EXISTS user_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('track', 'release')),
  purchase_date timestamptz DEFAULT now(),
  order_id uuid REFERENCES orders(id),
  play_count integer DEFAULT 0,
  last_played timestamptz,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Enable RLS
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own library"
  ON user_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own library"
  ON user_library FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_library_user_id ON user_library(user_id);
CREATE INDEX idx_user_library_content ON user_library(content_id, content_type);
CREATE INDEX idx_user_library_favorites ON user_library(user_id, is_favorite) WHERE is_favorite = true;

-- Function to get user's library
CREATE OR REPLACE FUNCTION get_user_library(
  user_id_param uuid,
  content_type_param text DEFAULT NULL,
  favorites_only boolean DEFAULT false,
  limit_param integer DEFAULT 100,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  type text,
  cover_url text,
  audio_url text,
  purchase_date timestamptz,
  play_count integer,
  is_favorite boolean,
  last_played timestamptz
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  -- Get tracks in library
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
    t.file_url as audio_url,
    ul.purchase_date,
    ul.play_count,
    ul.is_favorite,
    ul.last_played
  FROM user_library ul
  JOIN tracks t ON ul.content_id = t.id
  WHERE 
    ul.user_id = user_id_param
    AND ul.content_type = 'track'
    AND (content_type_param IS NULL OR content_type_param = 'track')
    AND (NOT favorites_only OR ul.is_favorite = true)
  
  UNION ALL
  
  -- Get releases in library
  SELECT 
    r.id,
    r.title,
    r.artist,
    'release' as type,
    COALESCE(r.artwork_url, 'default-release-cover.jpg') as cover_url,
    NULL as audio_url, -- Releases don't have a single audio URL
    ul.purchase_date,
    ul.play_count,
    ul.is_favorite,
    ul.last_played
  FROM user_library ul
  JOIN releases r ON ul.content_id = r.id
  WHERE 
    ul.user_id = user_id_param
    AND ul.content_type = 'release'
    AND (content_type_param IS NULL OR content_type_param = 'release')
    AND (NOT favorites_only OR ul.is_favorite = true)
  
  ORDER BY purchase_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Function to update play count
CREATE OR REPLACE FUNCTION increment_play_count(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_library
  SET 
    play_count = play_count + 1,
    last_played = now()
  WHERE 
    user_id = user_id_param
    AND content_id = content_id_param
    AND content_type = content_type_param;
END;
$$;

-- Function to toggle favorite status
CREATE OR REPLACE FUNCTION toggle_favorite(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_status boolean;
  new_status boolean;
BEGIN
  -- Get current favorite status
  SELECT is_favorite INTO current_status
  FROM user_library
  WHERE 
    user_id = user_id_param
    AND content_id = content_id_param
    AND content_type = content_type_param;
  
  -- Toggle status
  new_status := NOT current_status;
  
  -- Update record
  UPDATE user_library
  SET is_favorite = new_status
  WHERE 
    user_id = user_id_param
    AND content_id = content_id_param
    AND content_type = content_type_param;
  
  RETURN new_status;
END;
$$;

-- Function to add item to library on purchase
CREATE OR REPLACE FUNCTION add_to_library_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  content_id uuid;
  content_type text;
  user_id uuid;
BEGIN
  -- Get the product details
  SELECT 
    COALESCE(
      (metadata->>'track_id')::uuid,
      (metadata->>'release_id')::uuid
    ) INTO content_id
  FROM products
  WHERE id = NEW.product_id;
  
  -- Determine content type
  SELECT 
    CASE 
      WHEN metadata->>'track_id' IS NOT NULL THEN 'track'
      WHEN metadata->>'release_id' IS NOT NULL THEN 'release'
      ELSE NULL
    END INTO content_type
  FROM products
  WHERE id = NEW.product_id;
  
  -- Get user ID from order
  SELECT u.id INTO user_id
  FROM orders o
  JOIN users u ON o.customer_email = u.email
  WHERE o.id = NEW.order_id;
  
  -- If we have all required data, add to library
  IF content_id IS NOT NULL AND content_type IS NOT NULL AND user_id IS NOT NULL THEN
    INSERT INTO user_library (
      user_id,
      content_id,
      content_type,
      purchase_date,
      order_id
    ) VALUES (
      user_id,
      content_id,
      content_type,
      now(),
      NEW.order_id
    )
    ON CONFLICT (user_id, content_id, content_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to add purchased items to library
CREATE TRIGGER add_purchase_to_library
  AFTER INSERT ON order_lines
  FOR EACH ROW
  EXECUTE FUNCTION add_to_library_on_purchase();

-- Add feature flag for library
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, target_roles)
VALUES 
  ('LIBRARY_ENABLED', 'Enable music library for fans', true, 100, NULL)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  target_roles = EXCLUDED.target_roles,
  updated_at = now();

-- Insert sample data for testing
DO $$
DECLARE
  demo_user_id uuid;
  demo_order_id uuid;
  track_id uuid;
  release_id uuid;
BEGIN
  -- Only insert if we have a demo fan user
  SELECT id INTO demo_user_id
  FROM users
  WHERE email = 'fandemo@truindee.com';
  
  IF demo_user_id IS NOT NULL THEN
    -- Create a mock order if needed
    SELECT id INTO demo_order_id
    FROM orders
    LIMIT 1;
    
    IF demo_order_id IS NULL THEN
      INSERT INTO orders (
        id,
        workspace_id,
        customer_email,
        customer_name,
        status,
        total_amount
      ) VALUES (
        gen_random_uuid(),
        (SELECT id FROM workspaces LIMIT 1),
        'fandemo@truindee.com',
        'Demo Fan',
        'delivered',
        29.99
      )
      RETURNING id INTO demo_order_id;
    END IF;
    
    -- Get a track ID
    SELECT id INTO track_id
    FROM tracks
    LIMIT 1;
    
    -- Get a release ID
    SELECT id INTO release_id
    FROM releases
    LIMIT 1;
    
    -- Add sample library items
    IF track_id IS NOT NULL THEN
      INSERT INTO user_library (
        user_id,
        content_id,
        content_type,
        purchase_date,
        order_id,
        play_count,
        is_favorite
      ) VALUES (
        demo_user_id,
        track_id,
        'track',
        now() - interval '7 days',
        demo_order_id,
        5,
        true
      )
      ON CONFLICT (user_id, content_id, content_type) DO NOTHING;
    END IF;
    
    IF release_id IS NOT NULL THEN
      INSERT INTO user_library (
        user_id,
        content_id,
        content_type,
        purchase_date,
        order_id,
        play_count
      ) VALUES (
        demo_user_id,
        release_id,
        'release',
        now() - interval '14 days',
        demo_order_id,
        2
      )
      ON CONFLICT (user_id, content_id, content_type) DO NOTHING;
    END IF;
  END IF;
END $$;
/*
  # Function Search Path Security Fixes

  1. Purpose:
    - Fix function_search_path_mutable warnings
    - Set explicit search_path for all functions to prevent potential security issues

  2. Functions Fixed:
    - Agent-related functions:
      - search_agent_memories
      - check_agent_usage_quota
    - Store-related functions:
      - get_store_content
      - search_store_content
      - get_artist_store
      - get_featured_store_content
      - has_purchased
    - Library-related functions:
      - get_user_purchases
      - get_user_library
      - increment_play_count
      - toggle_favorite
      - add_to_library_on_purchase
    - Wallet-related functions:
      - calculate_artist_price
      - get_credit_wallet
      - add_credits
      - deduct_credits
      - check_auto_recharge
*/

-- Fix search_path for agent-related functions
CREATE OR REPLACE FUNCTION public.search_agent_memories(
  agent_id_param uuid,
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    agent_memories.id,
    agent_memories.content,
    1 - (agent_memories.embedding <=> query_embedding) AS similarity
  FROM public.agent_memories
  WHERE 
    agent_id = agent_id_param
    AND agent_memories.embedding IS NOT NULL
    AND 1 - (agent_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY agent_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_agent_usage_quota(
  workspace_id_param uuid,
  usage_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  monthly_limit integer;
  current_usage integer;
  current_month_start timestamptz;
BEGIN
  -- Get the start of the current month
  current_month_start := date_trunc('month', now());
  
  -- Set limits based on subscription tier and usage type
  SELECT 
    CASE 
      WHEN s.subscription_tier = 'free' AND usage_type_param = 'CHAT' THEN 10000
      WHEN s.subscription_tier = 'free' AND usage_type_param = 'TTS' THEN 5000
      WHEN s.subscription_tier = 'free' AND usage_type_param = 'STT' THEN 5000
      WHEN s.subscription_tier = 'pro' AND usage_type_param = 'CHAT' THEN 100000
      WHEN s.subscription_tier = 'pro' AND usage_type_param = 'TTS' THEN 50000
      WHEN s.subscription_tier = 'pro' AND usage_type_param = 'STT' THEN 50000
      WHEN s.subscription_tier = 'enterprise' THEN 1000000
      ELSE 10000
    END INTO monthly_limit
  FROM public.workspaces w
  LEFT JOIN (
    SELECT 'free' AS subscription_tier
  ) s ON true
  WHERE w.id = workspace_id_param;
  
  -- Get current usage for this month
  SELECT COALESCE(SUM(tokens_used), 0) INTO current_usage
  FROM public.agent_usage
  WHERE 
    workspace_id = workspace_id_param
    AND usage_type = usage_type_param
    AND created_at >= current_month_start;
  
  -- Return whether under quota
  RETURN current_usage < monthly_limit;
END;
$$;

-- Fix search_path for store-related functions
CREATE OR REPLACE FUNCTION public.get_store_content(
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
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM public.releases r 
       JOIN public.release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    COALESCE(
      (SELECT p.price FROM public.products p
       WHERE p.metadata->>'track_id' = t.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    t.created_at as release_date,
    t.workspace_id
  FROM public.tracks t
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
      (SELECT p.price FROM public.products p
       WHERE p.metadata->>'release_id' = r.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
    r.workspace_id
  FROM public.releases r
  WHERE 
    r.published = true
    AND (content_type IS NULL OR content_type = 'release')
  
  ORDER BY release_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.search_store_content(
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
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM public.releases r 
       JOIN public.release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    COALESCE(
      (SELECT p.price FROM public.products p
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
  FROM public.tracks t
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
      (SELECT p.price FROM public.products p
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
  FROM public.releases r
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

CREATE OR REPLACE FUNCTION public.get_artist_store(
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
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  artist_workspace_id uuid;
BEGIN
  -- Get the workspace ID for the artist
  SELECT workspace_id INTO artist_workspace_id
  FROM public.profiles
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
      (SELECT r.artwork_url FROM public.releases r 
       JOIN public.release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    COALESCE(
      (SELECT p.price FROM public.products p
       WHERE p.metadata->>'track_id' = t.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    t.created_at as release_date,
    t.workspace_id
  FROM public.tracks t
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
      (SELECT p.price FROM public.products p
       WHERE p.metadata->>'release_id' = r.id::text
       AND p.published = true
       AND p.active = true
       LIMIT 1),
      0
    ) as price,
    COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
    r.workspace_id
  FROM public.releases r
  WHERE 
    r.published = true
    AND r.workspace_id = artist_workspace_id
  
  ORDER BY release_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_featured_store_content(
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
SECURITY DEFINER
SET search_path = ''
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
        (SELECT r.artwork_url FROM public.releases r 
         JOIN public.release_tracks rt ON r.id = rt.release_id 
         WHERE rt.track_id = t.id
         LIMIT 1),
        'default-track-cover.jpg'
      ) as cover_url,
      COALESCE(
        (SELECT p.price FROM public.products p
         WHERE p.metadata->>'track_id' = t.id::text
         AND p.published = true
         AND p.active = true
         LIMIT 1),
        0
      ) as price,
      t.created_at as release_date,
      t.workspace_id,
      ROW_NUMBER() OVER (ORDER BY t.created_at DESC) as featured_position
    FROM public.tracks t
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
        (SELECT p.price FROM public.products p
         WHERE p.metadata->>'release_id' = r.id::text
         AND p.published = true
         AND p.active = true
         LIMIT 1),
        0
      ) as price,
      COALESCE(r.release_date::timestamptz, r.created_at) as release_date,
      r.workspace_id,
      ROW_NUMBER() OVER (ORDER BY COALESCE(r.release_date::timestamptz, r.created_at) DESC) as featured_position
    FROM public.releases r
    WHERE 
      r.published = true
  )
  SELECT * FROM featured
  WHERE featured_position <= limit_param
  ORDER BY featured_position;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_purchased(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_lines ol ON o.id = ol.order_id
    JOIN public.products p ON ol.product_id = p.id
    WHERE 
      -- Match the user who made the purchase
      o.customer_email = (SELECT email FROM public.users WHERE id = user_id_param)
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

-- Fix search_path for library-related functions
CREATE OR REPLACE FUNCTION public.get_user_purchases(
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
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH user_orders AS (
    SELECT o.id as order_id, o.created_at as purchase_date
    FROM public.orders o
    WHERE 
      o.customer_email = (SELECT email FROM public.users WHERE id = user_id_param)
      AND o.status IN ('shipped', 'delivered')
  )
  
  -- Get purchased tracks
  SELECT 
    t.id,
    t.title,
    t.artist,
    'track' as type,
    COALESCE(
      (SELECT r.artwork_url FROM public.releases r 
       JOIN public.release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    uo.purchase_date,
    uo.order_id
  FROM public.tracks t
  JOIN public.products p ON p.metadata->>'track_id' = t.id::text
  JOIN public.order_lines ol ON ol.product_id = p.id
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
  FROM public.releases r
  JOIN public.products p ON p.metadata->>'release_id' = r.id::text
  JOIN public.order_lines ol ON ol.product_id = p.id
  JOIN user_orders uo ON uo.order_id = ol.order_id
  
  ORDER BY purchase_date DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_library(
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
SECURITY DEFINER
SET search_path = ''
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
      (SELECT r.artwork_url FROM public.releases r 
       JOIN public.release_tracks rt ON r.id = rt.release_id 
       WHERE rt.track_id = t.id
       LIMIT 1),
      'default-track-cover.jpg'
    ) as cover_url,
    t.file_url as audio_url,
    ul.purchase_date,
    ul.play_count,
    ul.is_favorite,
    ul.last_played
  FROM public.user_library ul
  JOIN public.tracks t ON ul.content_id = t.id
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
  FROM public.user_library ul
  JOIN public.releases r ON ul.content_id = r.id
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

CREATE OR REPLACE FUNCTION public.increment_play_count(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.user_library
  SET 
    play_count = play_count + 1,
    last_played = now()
  WHERE 
    user_id = user_id_param
    AND content_id = content_id_param
    AND content_type = content_type_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_favorite(
  user_id_param uuid,
  content_id_param uuid,
  content_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_status boolean;
  new_status boolean;
BEGIN
  -- Get current favorite status
  SELECT is_favorite INTO current_status
  FROM public.user_library
  WHERE 
    user_id = user_id_param
    AND content_id = content_id_param
    AND content_type = content_type_param;
  
  -- Toggle status
  new_status := NOT current_status;
  
  -- Update record
  UPDATE public.user_library
  SET is_favorite = new_status
  WHERE 
    user_id = user_id_param
    AND content_id = content_id_param
    AND content_type = content_type_param;
  
  RETURN new_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_to_library_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
  FROM public.products
  WHERE id = NEW.product_id;
  
  -- Determine content type
  SELECT 
    CASE 
      WHEN metadata->>'track_id' IS NOT NULL THEN 'track'
      WHEN metadata->>'release_id' IS NOT NULL THEN 'release'
      ELSE NULL
    END INTO content_type
  FROM public.products
  WHERE id = NEW.product_id;
  
  -- Get user ID from order
  SELECT u.id INTO user_id
  FROM public.orders o
  JOIN public.users u ON o.customer_email = u.email
  WHERE o.id = NEW.order_id;
  
  -- If we have all required data, add to library
  IF content_id IS NOT NULL AND content_type IS NOT NULL AND user_id IS NOT NULL THEN
    INSERT INTO public.user_library (
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

-- Fix search_path for credit-related functions
CREATE OR REPLACE FUNCTION public.calculate_artist_price(
  base_cost_cents int,
  buffer_pct int,
  margin_pct int
)
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Formula: base_cost * (1 + buffer_pct/100) * (1 + margin_pct/100)
  RETURN round(base_cost_cents * (1 + buffer_pct::float/100) * (1 + margin_pct::float/100));
END;
$$;

CREATE OR REPLACE FUNCTION public.get_credit_wallet(workspace_id_param uuid)
RETURNS TABLE (
  balance_cents bigint,
  auto_recharge boolean,
  recharge_threshold_cents int,
  recharge_amount_cents int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create wallet if it doesn't exist
  INSERT INTO public.credit_wallets (workspace_id)
  VALUES (workspace_id_param)
  ON CONFLICT (workspace_id) DO NOTHING;
  
  -- Return wallet data
  RETURN QUERY
  SELECT 
    w.balance_cents,
    w.auto_recharge,
    w.recharge_threshold_cents,
    w.recharge_amount_cents
  FROM public.credit_wallets w
  WHERE w.workspace_id = workspace_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_credits(
  workspace_id_param uuid,
  amount_cents_param bigint,
  payment_id_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert transaction
  INSERT INTO public.credit_transactions (
    workspace_id,
    type,
    amount_cents,
    twilio_sid
  ) VALUES (
    workspace_id_param,
    'TOPUP',
    amount_cents_param,
    payment_id_param
  );
  
  -- Update wallet balance
  UPDATE public.credit_wallets
  SET balance_cents = balance_cents + amount_cents_param
  WHERE workspace_id = workspace_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_credits(
  workspace_id_param uuid,
  amount_cents_param bigint,
  usage_id_param text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_balance bigint;
BEGIN
  -- Get current balance
  SELECT balance_cents INTO current_balance
  FROM public.credit_wallets
  WHERE workspace_id = workspace_id_param;
  
  -- Check if sufficient balance
  IF current_balance < amount_cents_param THEN
    RETURN false;
  END IF;
  
  -- Insert transaction
  INSERT INTO public.credit_transactions (
    workspace_id,
    type,
    amount_cents,
    twilio_sid
  ) VALUES (
    workspace_id_param,
    'USAGE',
    -amount_cents_param,
    usage_id_param
  );
  
  -- Update wallet balance
  UPDATE public.credit_wallets
  SET balance_cents = balance_cents - amount_cents_param
  WHERE workspace_id = workspace_id_param;
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_auto_recharge(workspace_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  wallet record;
BEGIN
  -- Get wallet data
  SELECT * INTO wallet
  FROM public.credit_wallets
  WHERE workspace_id = workspace_id_param;
  
  -- Check if auto-recharge is enabled and balance is below threshold
  IF wallet.auto_recharge AND wallet.balance_cents < wallet.recharge_threshold_cents THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Log that the additional function search_path security fixes have been applied
DO $$
BEGIN
  RAISE NOTICE 'Additional function search_path security fixes applied successfully';
END$$;
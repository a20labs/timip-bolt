-- =============================================
-- FEATURE FLAGS SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles text[] DEFAULT NULL,
  target_workspaces uuid[] DEFAULT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT feature_flags_name_key UNIQUE (name)
);

-- Index for fast feature flag lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled 
ON feature_flags (enabled);

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Check if user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
END;
$$;

-- Enhanced membership check with role validation
CREATE OR REPLACE FUNCTION is_member_of_workspace(workspace_uuid uuid, required_roles text[] DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Superadmin has access to everything
  IF is_superadmin() THEN
    RETURN true;
  END IF;
  
  -- Check if user is a member and optionally validate role
  SELECT role::text INTO user_role
  FROM workspace_members
  WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid();
  
  -- Return false if not a member
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- If specific roles required, check membership
  IF required_roles IS NOT NULL THEN
    RETURN user_role = ANY(required_roles);
  END IF;
  
  RETURN true;
END;
$$;

-- Get user's current role in workspace
CREATE OR REPLACE FUNCTION get_user_role_in_workspace(workspace_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM workspace_members
  WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'none');
END;
$$;

-- Check feature flag status for user/workspace
CREATE OR REPLACE FUNCTION check_feature_flag(
  flag_name text,
  workspace_id_param uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  flag_record RECORD;
  user_role text;
  user_hash integer;
BEGIN
  -- Superadmin bypasses all feature flags
  IF is_superadmin() THEN
    RETURN true;
  END IF;
  
  -- Get feature flag
  SELECT enabled, rollout_percentage, target_roles, target_workspaces
  INTO flag_record
  FROM feature_flags
  WHERE name = flag_name;
  
  -- If flag doesn't exist, default to false
  IF flag_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- If flag is disabled, return false
  IF NOT flag_record.enabled THEN
    RETURN false;
  END IF;
  
  -- Check workspace targeting
  IF flag_record.target_workspaces IS NOT NULL AND workspace_id_param IS NOT NULL THEN
    IF NOT (workspace_id_param = ANY(flag_record.target_workspaces)) THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check role targeting
  IF flag_record.target_roles IS NOT NULL AND workspace_id_param IS NOT NULL THEN
    user_role := get_user_role_in_workspace(workspace_id_param);
    IF NOT (user_role = ANY(flag_record.target_roles)) THEN
      RETURN false;
    END IF;
  END IF;
  
  -- Check rollout percentage (simple hash-based rollout)
  IF flag_record.rollout_percentage < 100 THEN
    user_hash := abs(hashtext(auth.uid()::text)) % 100;
    IF user_hash >= flag_record.rollout_percentage THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on feature flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- FEATURE FLAGS POLICIES
DROP POLICY IF EXISTS "feature_flags_read" ON feature_flags;
CREATE POLICY "feature_flags_read" ON feature_flags
FOR SELECT USING (true); -- All authenticated users can read feature flags

DROP POLICY IF EXISTS "feature_flags_manage" ON feature_flags;
CREATE POLICY "feature_flags_manage" ON feature_flags
FOR ALL USING (is_superadmin());

-- Update existing RLS policies to use new function names and correct column references
-- WORKSPACES POLICIES
DROP POLICY IF EXISTS "workspace_access" ON workspaces;
CREATE POLICY "workspace_access" ON workspaces
FOR ALL USING (
  is_superadmin() OR 
  is_member_of_workspace(id) OR 
  owner_id = auth.uid()
);

-- WORKSPACE_MEMBERS POLICIES
DROP POLICY IF EXISTS "members_read" ON workspace_members;
CREATE POLICY "members_read" ON workspace_members
FOR SELECT USING (
  is_superadmin() OR 
  is_member_of_workspace(workspace_id) OR
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "members_manage" ON workspace_members;
CREATE POLICY "members_manage" ON workspace_members
FOR INSERT WITH CHECK (
  is_superadmin() OR
  is_member_of_workspace(workspace_id, ARRAY['owner', 'admin'])
);

-- TRACKS POLICIES (using existing schema columns only)
DROP POLICY IF EXISTS "tracks_read" ON tracks;
CREATE POLICY "tracks_read" ON tracks
FOR SELECT USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id)
);

DROP POLICY IF EXISTS "tracks_write" ON tracks;
CREATE POLICY "tracks_write" ON tracks
FOR ALL USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id, ARRAY['owner', 'admin', 'collaborator'])
);

-- RELEASES POLICIES (using existing schema columns only)
DROP POLICY IF EXISTS "releases_read" ON releases;
CREATE POLICY "releases_read" ON releases
FOR SELECT USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id)
);

DROP POLICY IF EXISTS "releases_write" ON releases;
CREATE POLICY "releases_write" ON releases
FOR ALL USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id, ARRAY['owner', 'admin', 'collaborator'])
);

-- PRODUCTS POLICIES (using existing schema columns only)
DROP POLICY IF EXISTS "products_read" ON products;
CREATE POLICY "products_read" ON products
FOR SELECT USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id)
);

DROP POLICY IF EXISTS "products_write" ON products;
CREATE POLICY "products_write" ON products
FOR ALL USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id, ARRAY['owner', 'admin'])
);

-- POSTS POLICIES (using existing schema columns only)
DROP POLICY IF EXISTS "posts_read" ON posts;
CREATE POLICY "posts_read" ON posts
FOR SELECT USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id) OR
  author_id = auth.uid()
);

DROP POLICY IF EXISTS "posts_write" ON posts;
CREATE POLICY "posts_write" ON posts
FOR ALL USING (
  is_superadmin() OR
  is_member_of_workspace(workspace_id) OR
  author_id = auth.uid()
);

-- LIVESTREAMS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'livestreams') THEN
    EXECUTE 'DROP POLICY IF EXISTS "livestreams_read" ON livestreams';
    EXECUTE 'CREATE POLICY "livestreams_read" ON livestreams
             FOR SELECT USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id)
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "livestreams_write" ON livestreams';
    EXECUTE 'CREATE POLICY "livestreams_write" ON livestreams
             FOR ALL USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id, ARRAY[''owner'', ''admin'', ''collaborator''])
             )';
  END IF;
END $$;

-- MEMBERSHIPS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memberships') THEN
    EXECUTE 'DROP POLICY IF EXISTS "memberships_read" ON memberships';
    EXECUTE 'CREATE POLICY "memberships_read" ON memberships
             FOR SELECT USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id)
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "memberships_write" ON memberships';
    EXECUTE 'CREATE POLICY "memberships_write" ON memberships
             FOR ALL USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id, ARRAY[''owner'', ''admin''])
             )';
  END IF;
END $$;

-- PROMO_CLIPS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promo_clips') THEN
    EXECUTE 'DROP POLICY IF EXISTS "promo_clips_read" ON promo_clips';
    EXECUTE 'CREATE POLICY "promo_clips_read" ON promo_clips
             FOR SELECT USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id)
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "promo_clips_write" ON promo_clips';
    EXECUTE 'CREATE POLICY "promo_clips_write" ON promo_clips
             FOR ALL USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id, ARRAY[''owner'', ''admin'', ''collaborator''])
             )';
  END IF;
END $$;

-- ASSETS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets') THEN
    EXECUTE 'DROP POLICY IF EXISTS "assets_read" ON assets';
    EXECUTE 'CREATE POLICY "assets_read" ON assets
             FOR SELECT USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id)
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "assets_write" ON assets';
    EXECUTE 'CREATE POLICY "assets_write" ON assets
             FOR ALL USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id, ARRAY[''owner'', ''admin'', ''collaborator''])
             )';
  END IF;
END $$;

-- ORDERS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    EXECUTE 'DROP POLICY IF EXISTS "orders_read" ON orders';
    EXECUTE 'CREATE POLICY "orders_read" ON orders
             FOR SELECT USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id)
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "orders_write" ON orders';
    EXECUTE 'CREATE POLICY "orders_write" ON orders
             FOR ALL USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id, ARRAY[''owner'', ''admin''])
             )';
  END IF;
END $$;

-- ORDER_LINES POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_lines') THEN
    EXECUTE 'DROP POLICY IF EXISTS "order_lines_read" ON order_lines';
    EXECUTE 'CREATE POLICY "order_lines_read" ON order_lines
             FOR SELECT USING (
               is_superadmin() OR
               EXISTS (
                 SELECT 1 FROM orders 
                 WHERE orders.id = order_lines.order_id 
                 AND is_member_of_workspace(orders.workspace_id)
               )
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "order_lines_write" ON order_lines';
    EXECUTE 'CREATE POLICY "order_lines_write" ON order_lines
             FOR ALL USING (
               is_superadmin() OR
               EXISTS (
                 SELECT 1 FROM orders 
                 WHERE orders.id = order_lines.order_id 
                 AND is_member_of_workspace(orders.workspace_id, ARRAY[''owner'', ''admin''])
               )
             )';
  END IF;
END $$;

-- RELEASE_TRACKS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'release_tracks') THEN
    EXECUTE 'DROP POLICY IF EXISTS "release_tracks_read" ON release_tracks';
    EXECUTE 'CREATE POLICY "release_tracks_read" ON release_tracks
             FOR SELECT USING (
               is_superadmin() OR
               EXISTS (
                 SELECT 1 FROM releases 
                 WHERE releases.id = release_tracks.release_id 
                 AND is_member_of_workspace(releases.workspace_id)
               )
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "release_tracks_write" ON release_tracks';
    EXECUTE 'CREATE POLICY "release_tracks_write" ON release_tracks
             FOR ALL USING (
               is_superadmin() OR
               EXISTS (
                 SELECT 1 FROM releases 
                 WHERE releases.id = release_tracks.release_id 
                 AND is_member_of_workspace(releases.workspace_id, ARRAY[''owner'', ''admin'', ''collaborator''])
               )
             )';
  END IF;
END $$;

-- NFTS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nfts') THEN
    EXECUTE 'DROP POLICY IF EXISTS "nfts_read" ON nfts';
    EXECUTE 'CREATE POLICY "nfts_read" ON nfts
             FOR SELECT USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id)
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "nfts_write" ON nfts';
    EXECUTE 'CREATE POLICY "nfts_write" ON nfts
             FOR ALL USING (
               is_superadmin() OR
               is_member_of_workspace(workspace_id, ARRAY[''owner'', ''admin''])
             )';
  END IF;
END $$;

-- APPLICATION_SETTINGS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'application_settings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "application_settings_read" ON application_settings';
    EXECUTE 'CREATE POLICY "application_settings_read" ON application_settings
             FOR SELECT USING (
               category = ''public'' OR is_superadmin()
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "application_settings_write" ON application_settings';
    EXECUTE 'CREATE POLICY "application_settings_write" ON application_settings
             FOR ALL USING (is_superadmin())';
  END IF;
END $$;

-- SYSTEM_NOTIFICATIONS POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_notifications') THEN
    EXECUTE 'DROP POLICY IF EXISTS "system_notifications_read" ON system_notifications';
    EXECUTE 'CREATE POLICY "system_notifications_read" ON system_notifications
             FOR SELECT USING (
               is_superadmin() OR
               (active = true AND (expires_at IS NULL OR expires_at > now()))
             )';
    
    EXECUTE 'DROP POLICY IF EXISTS "system_notifications_write" ON system_notifications';
    EXECUTE 'CREATE POLICY "system_notifications_write" ON system_notifications
             FOR ALL USING (is_superadmin())';
  END IF;
END $$;

-- =============================================
-- AUDIT LOGGING SYSTEM
-- =============================================

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
ON audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON audit_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type 
ON audit_logs (resource_type);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_read_own" ON audit_logs;
CREATE POLICY "audit_logs_read_own" ON audit_logs
FOR SELECT USING (
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "audit_logs_read_superadmin" ON audit_logs;
CREATE POLICY "audit_logs_read_superadmin" ON audit_logs
FOR SELECT USING (
  is_superadmin()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    workspace_id
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    COALESCE(NEW.workspace_id, OLD.workspace_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to key tables (only if they don't exist)
DO $$
BEGIN
  -- Workspaces audit trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_workspaces'
  ) THEN
    CREATE TRIGGER audit_workspaces
      AFTER INSERT OR UPDATE OR DELETE ON workspaces
      FOR EACH ROW EXECUTE FUNCTION audit_trigger();
  END IF;

  -- Tracks audit trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_tracks'
  ) THEN
    CREATE TRIGGER audit_tracks
      AFTER INSERT OR UPDATE OR DELETE ON tracks
      FOR EACH ROW EXECUTE FUNCTION audit_trigger();
  END IF;

  -- Releases audit trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_releases'
  ) THEN
    CREATE TRIGGER audit_releases
      AFTER INSERT OR UPDATE OR DELETE ON releases
      FOR EACH ROW EXECUTE FUNCTION audit_trigger();
  END IF;

  -- Products audit trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_products'
  ) THEN
    CREATE TRIGGER audit_products
      AFTER INSERT OR UPDATE OR DELETE ON products
      FOR EACH ROW EXECUTE FUNCTION audit_trigger();
  END IF;

  -- Posts audit trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_posts'
  ) THEN
    CREATE TRIGGER audit_posts
      AFTER INSERT OR UPDATE OR DELETE ON posts
      FOR EACH ROW EXECUTE FUNCTION audit_trigger();
  END IF;
END $$;

-- =============================================
-- SEED DATA FOR TESTING
-- =============================================

-- Insert demo feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, metadata)
VALUES 
  ('SYNC_MARKETPLACE', 'Global sync licensing marketplace', true, 100, '{"tier": "pro"}'),
  ('ADVANCED_ANALYTICS', 'Advanced analytics dashboard', true, 50, '{"tier": "pro"}'),
  ('NFT_MINTING', 'NFT minting capabilities', false, 0, '{"tier": "enterprise"}'),
  ('WHITE_LABEL', 'White-label platform', false, 0, '{"tier": "enterprise"}'),
  ('RELEASE_SCHEDULING', 'Advanced release scheduling', true, 75, '{"tier": "pro"}'),
  ('MEMBERSHIP_TIERS', 'Fan membership tiers', true, 100, '{"tier": "pro"}'),
  ('REVENUE_TRACKING', 'Revenue tracking and analytics', true, 100, '{"tier": "pro"}'),
  ('CUSTOM_BRANDING', 'Custom branding options', false, 0, '{"tier": "pro"}'),
  ('API_ACCESS', 'API access for integrations', false, 0, '{"tier": "pro"}'),
  ('PRIORITY_SUPPORT', 'Priority customer support', false, 0, '{"tier": "pro"}'),
  ('STEM_ACCESS', 'Stems and assets management', true, 50, '{"tier": "pro"}'),
  ('CAMPAIGN_ANALYTICS', 'Campaign analytics and tracking', true, 25, '{"tier": "pro"}'),
  ('PRICING_COUPONS', 'Pricing and coupon management', false, 0, '{"tier": "pro"}'),
  ('PAYOUT_SPLITS', 'Payout and royalty splits', true, 100, '{"tier": "pro"}'),
  ('TAX_MANAGEMENT', 'Tax management and reporting', false, 0, '{"tier": "enterprise"}'),
  ('MULTI_WORKSPACE', 'Multi-workspace management', false, 0, '{"tier": "enterprise"}')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  metadata = EXCLUDED.metadata,
  updated_at = now();
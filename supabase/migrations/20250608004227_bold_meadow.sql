/*
  # Create Superadmin User and Application Management

  1. New Features
    - Create superadmin role with full application access
    - Add application management tables
    - Create admin dashboard functionality
    - Add system-wide permissions

  2. Security
    - Superadmin bypasses all RLS policies
    - Full access to all workspaces and data
    - Application management capabilities

  3. Tables
    - Update users table with superadmin role
    - Add application_settings table
    - Add audit_logs table for admin actions
*/

-- Add superadmin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Create application_settings table for system configuration
CREATE TABLE IF NOT EXISTS application_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  category text DEFAULT 'general',
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  workspace_id uuid REFERENCES workspaces(id),
  created_at timestamptz DEFAULT now()
);

-- Create system_notifications table for admin announcements
CREATE TABLE IF NOT EXISTS system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- info, warning, error, success
  target_roles text[] DEFAULT ARRAY['artist', 'fan', 'manager'],
  target_workspaces uuid[],
  active boolean DEFAULT true,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create feature_flags table for controlling application features
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles text[],
  target_workspaces uuid[],
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE application_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create superadmin policies (bypass RLS for superadmins)
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Application settings policies
CREATE POLICY "Superadmins can manage application settings"
  ON application_settings FOR ALL
  TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

CREATE POLICY "Users can read public application settings"
  ON application_settings FOR SELECT
  TO authenticated
  USING (category = 'public');

-- Audit logs policies
CREATE POLICY "Superadmins can read all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_superadmin());

CREATE POLICY "Users can read their own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System notifications policies
CREATE POLICY "Superadmins can manage system notifications"
  ON system_notifications FOR ALL
  TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

CREATE POLICY "Users can read active notifications for their role"
  ON system_notifications FOR SELECT
  TO authenticated
  USING (
    active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      target_roles IS NULL 
      OR (SELECT role FROM users WHERE id = auth.uid()) = ANY(target_roles)
    )
  );

-- Feature flags policies
CREATE POLICY "Superadmins can manage feature flags"
  ON feature_flags FOR ALL
  TO authenticated
  USING (is_superadmin())
  WITH CHECK (is_superadmin());

CREATE POLICY "Users can read feature flags"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Override RLS for superadmins on all existing tables
CREATE OR REPLACE FUNCTION create_superadmin_policies()
RETURNS void AS $$
DECLARE
  table_name text;
  tables_to_update text[] := ARRAY[
    'workspaces', 'workspace_members', 'tracks', 'releases', 'release_tracks',
    'assets', 'products', 'orders', 'order_lines', 'nfts', 'posts',
    'livestreams', 'memberships', 'promo_clips', 'users'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_update
  LOOP
    -- Create superadmin policy for each table
    EXECUTE format('
      CREATE POLICY "Superadmins have full access to %I"
        ON %I FOR ALL
        TO authenticated
        USING (is_superadmin())
        WITH CHECK (is_superadmin())
    ', table_name, table_name);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create policies
SELECT create_superadmin_policies();

-- Insert default application settings
INSERT INTO application_settings (key, value, description, category) VALUES
  ('platform_name', '"TruIndee"', 'Platform display name', 'branding'),
  ('maintenance_mode', 'false', 'Enable maintenance mode', 'system'),
  ('max_file_size_mb', '100', 'Maximum file upload size in MB', 'uploads'),
  ('supported_audio_formats', '["mp3", "wav", "flac", "aiff"]', 'Supported audio file formats', 'uploads'),
  ('default_subscription_tier', '"free"', 'Default subscription tier for new users', 'subscriptions'),
  ('enable_nft_marketplace', 'true', 'Enable NFT marketplace features', 'features'),
  ('enable_livestreaming', 'true', 'Enable livestreaming features', 'features'),
  ('stripe_enabled', 'true', 'Enable Stripe payments', 'payments'),
  ('email_notifications_enabled', 'true', 'Enable email notifications', 'notifications')
ON CONFLICT (key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_percentage) VALUES
  ('advanced_analytics', 'Advanced analytics dashboard', true, 100),
  ('nft_minting', 'NFT minting capabilities', true, 100),
  ('ai_mastering', 'AI-powered audio mastering', false, 0),
  ('collaborative_playlists', 'Collaborative playlist creation', true, 50),
  ('virtual_concerts', 'Virtual concert hosting', true, 100),
  ('blockchain_royalties', 'Blockchain-based royalty distribution', false, 10)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_active ON system_notifications(active);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_workspace_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id,
    old_values, new_values, workspace_id
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_workspace_id
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
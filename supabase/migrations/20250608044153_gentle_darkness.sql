/*
  # Fix Feature Flags Migration

  1. New Tables
    - Ensures `feature_flags` table exists with proper structure
    - Adds necessary indexes and RLS policies
  
  2. Changes
    - Adds conditional checks to prevent errors when policies already exist
    - Inserts phone dialer feature flag if it doesn't exist
  
  3. Security
    - Enables RLS on feature_flags table
    - Creates appropriate policies for access control
*/

-- Create feature_flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_roles text[],
  target_users text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_flags' AND policyname = 'feature_flags_manage'
  ) THEN
    CREATE POLICY "feature_flags_manage" 
      ON feature_flags 
      FOR ALL 
      TO public 
      USING (is_superadmin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feature_flags' AND policyname = 'feature_flags_read'
  ) THEN
    CREATE POLICY "feature_flags_read" 
      ON feature_flags 
      FOR SELECT 
      TO public 
      USING (true);
  END IF;
END $$;

-- Insert initial phone feature flag if it doesn't exist
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, target_roles)
VALUES ('PHONE_DIALER', 'Enable phone calling features with AI agents', false, 100, ARRAY['artist', 'manager', 'label_admin'])
ON CONFLICT (name) DO NOTHING;
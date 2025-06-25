/*
  # Feature Flags Schema

  1. New Tables
    - `feature_flags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `enabled` (boolean)
      - `rollout_percentage` (integer)
      - `target_roles` (text[])
      - `target_users` (text[])
      - `metadata` (jsonb)
      - `created_by` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `feature_flags` table
    - Add policies for superadmin management and public read access
    
  3. Initial Data
    - Add phone dialer feature flag
    - Add grid view feature flag
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

-- Insert initial feature flags if they don't exist
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, target_roles)
VALUES 
  ('PHONE_DIALER', 'Enable phone calling features with AI agents', false, 100, ARRAY['artist', 'manager', 'label_admin']),
  ('GRID_VIEW', 'Enable grid view for catalog and other listings', true, 100, ARRAY['artist', 'manager', 'label_admin', 'fan', 'educator'])
ON CONFLICT (name) DO NOTHING;
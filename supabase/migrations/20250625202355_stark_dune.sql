/*
  # SMS Messaging System

  1. New Tables
    - `sms_messages` - Store SMS messages sent through the system
      - `id` (bigserial, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `to_number` (text)
      - `from_number` (text)
      - `message` (text)
      - `status` (text)
      - `twilio_sid` (text)
      - `cost_cents` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `sms_messages` table
    - Add policies for workspace-based access control
    
  3. Features
    - Allow sending SMS messages via Twilio
    - Track message history
    - Calculate and deduct credits for each message
*/

-- Create sms_messages table
CREATE TABLE IF NOT EXISTS sms_messages (
  id bigserial PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  to_number text NOT NULL,
  from_number text NOT NULL,
  message text NOT NULL,
  status text NOT NULL,
  twilio_sid text,
  cost_cents integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sms_messages_workspace_id ON sms_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_created_at ON sms_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_messages_to_number ON sms_messages(to_number);
CREATE INDEX IF NOT EXISTS idx_sms_messages_from_number ON sms_messages(from_number);

-- Enable RLS
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can read their workspace's messages"
  ON sms_messages
  FOR SELECT
  USING (is_member_of_workspace(workspace_id));

CREATE POLICY "Members can insert messages for their workspace"
  ON sms_messages
  FOR INSERT
  WITH CHECK (is_member_of_workspace(workspace_id));

-- Add SMS rate if it doesn't exist
INSERT INTO comm_rates (code, cost_cents, buffer_pct, margin_pct)
VALUES 
  ('SMS_US_OUT', 83, 15, 20),
  ('SMS_US_IN', 75, 15, 20),
  ('SMS_INTL_OUT', 350, 15, 20)
ON CONFLICT (code) DO NOTHING;

-- Create function to get message history
CREATE OR REPLACE FUNCTION get_message_history(
  workspace_id_param uuid,
  number_filter text DEFAULT NULL,
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  id bigint,
  to_number text,
  from_number text,
  message text,
  status text,
  twilio_sid text,
  cost_cents integer,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.to_number,
    m.from_number,
    m.message,
    m.status,
    m.twilio_sid,
    m.cost_cents,
    m.created_at
  FROM public.sms_messages m
  WHERE 
    m.workspace_id = workspace_id_param
    AND (
      number_filter IS NULL 
      OR m.to_number LIKE '%' || number_filter || '%'
      OR m.from_number LIKE '%' || number_filter || '%'
    )
  ORDER BY m.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Add feature flag
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, target_roles)
VALUES ('SMS_MESSAGING', 'Enable SMS messaging features', true, 100, ARRAY['artist', 'manager', 'label_admin'])
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  target_roles = EXCLUDED.target_roles,
  updated_at = now();
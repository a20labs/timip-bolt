/*
  # Add Phone Calls Table

  1. New Tables
    - `phone_calls`
      - `id` (bigserial, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `to_number` (text)
      - `from_number` (text)
      - `duration` (integer)
      - `status` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `phone_calls` table
    - Add policy for members to read their workspace's calls
    - Add policy for members to insert calls for their workspace
*/

-- Create phone_calls table
CREATE TABLE IF NOT EXISTS phone_calls (
  id bigserial PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  to_number text NOT NULL,
  from_number text NOT NULL,
  duration integer DEFAULT 0,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_phone_calls_workspace_id ON phone_calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_phone_calls_created_at ON phone_calls(created_at);

-- Enable RLS
ALTER TABLE phone_calls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can read their workspace's calls"
  ON phone_calls
  FOR SELECT
  USING (is_member_of_workspace(workspace_id));

CREATE POLICY "Members can insert calls for their workspace"
  ON phone_calls
  FOR INSERT
  WITH CHECK (is_member_of_workspace(workspace_id));
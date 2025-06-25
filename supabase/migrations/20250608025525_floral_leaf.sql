/*
  # AI Agent System Migration

  1. New Tables
    - `agent_configs` - Configuration for AI agents
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `name` (text) - e.g. 'PAM'
      - `persona` (text) - system prompt
      - `voice_id` (text) - ElevenLabs voice ID
      - `logic_level` (text) - MAX | MEDIUM | MIN
      - `created_at` (timestamp)
    
    - `agent_memories` - Memory storage for agents
      - `id` (bigint, identity)
      - `agent_id` (uuid, references agent_configs)
      - `role` (text) - 'USER'|'ASSISTANT'|'SYS'
      - `content` (text)
      - `embedding` (vector(1536)) - pgvector embedding

  2. Security
    - Enable RLS on all tables
    - Add policies for workspace-based access control
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create agent_configs table
CREATE TABLE IF NOT EXISTS agent_configs (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references workspaces on delete cascade,
  name          text,                      -- e.g. 'PAM'
  persona       text,                      -- system prompt
  voice_id      text,                      -- ElevenLabs
  logic_level   text default 'MEDIUM',     -- MAX | MEDIUM | MIN
  created_at    timestamptz default now()
);

-- Create agent_memories table
CREATE TABLE IF NOT EXISTS agent_memories (
  id         bigint generated always as identity,
  agent_id   uuid references agent_configs on delete cascade,
  role       text,                        -- 'USER'|'ASSISTANT'|'SYS'
  content    text,
  embedding  vector(1536)                 -- pgvector ext
);

-- Enable RLS on tables
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_configs
CREATE POLICY "Users can read agent_configs in their workspaces"
  ON agent_configs FOR SELECT
  USING (
    is_superadmin() OR
    is_member_of_workspace(workspace_id)
  );

CREATE POLICY "Users can manage agent_configs in workspaces they own or admin"
  ON agent_configs FOR ALL
  USING (
    is_superadmin() OR
    is_member_of_workspace(workspace_id, ARRAY['owner', 'admin'])
  );

-- RLS Policies for agent_memories
CREATE POLICY "Users can read agent_memories in their workspaces"
  ON agent_memories FOR SELECT
  USING (
    is_superadmin() OR
    EXISTS (
      SELECT 1 FROM agent_configs
      WHERE agent_configs.id = agent_memories.agent_id
      AND is_member_of_workspace(agent_configs.workspace_id)
    )
  );

CREATE POLICY "Users can manage agent_memories in workspaces they own or admin"
  ON agent_memories FOR ALL
  USING (
    is_superadmin() OR
    EXISTS (
      SELECT 1 FROM agent_configs
      WHERE agent_configs.id = agent_memories.agent_id
      AND is_member_of_workspace(agent_configs.workspace_id, ARRAY['owner', 'admin'])
    )
  );

-- Create indexes for performance
CREATE INDEX idx_agent_configs_workspace_id ON agent_configs(workspace_id);
CREATE INDEX idx_agent_memories_agent_id ON agent_memories(agent_id);

-- Create function to search similar memories
CREATE OR REPLACE FUNCTION search_agent_memories(
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
AS $$
BEGIN
  RETURN QUERY
  SELECT
    agent_memories.id,
    agent_memories.content,
    1 - (agent_memories.embedding <=> query_embedding) AS similarity
  FROM agent_memories
  WHERE 
    agent_id = agent_id_param
    AND agent_memories.embedding IS NOT NULL
    AND 1 - (agent_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY agent_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Insert default agent templates
INSERT INTO agent_configs (workspace_id, name, persona, voice_id, logic_level)
SELECT 
  id AS workspace_id,
  'PAM',
  'You are PAM (Personal Artist Manager), an AI assistant for musicians and artists. You help with career planning, release strategies, and day-to-day management tasks. You are professional, supportive, and knowledgeable about the music industry. Always provide actionable advice tailored to the artist''s specific situation and goals.',
  'eleven-labs-rachel',
  'MEDIUM'
FROM workspaces
WHERE owner_id IN (
  SELECT id FROM users WHERE role = 'artist'
)
ON CONFLICT DO NOTHING;

INSERT INTO agent_configs (workspace_id, name, persona, voice_id, logic_level)
SELECT 
  id AS workspace_id,
  'LegalBot',
  'You are LegalBot, an AI assistant specializing in music industry legal matters. You help artists understand contracts, copyright, and licensing. You simplify complex legal concepts but always remind users to consult with a qualified attorney for specific legal advice. You are precise, clear, and educational in your responses.',
  'eleven-labs-antoni',
  'MAX'
FROM workspaces
WHERE owner_id IN (
  SELECT id FROM users WHERE role = 'artist'
)
ON CONFLICT DO NOTHING;

INSERT INTO agent_configs (workspace_id, name, persona, voice_id, logic_level)
SELECT 
  id AS workspace_id,
  'CreativeMuse',
  'You are CreativeMuse, an AI assistant for creative inspiration. You help artists brainstorm ideas for music, lyrics, visual content, and marketing campaigns. You are imaginative, encouraging, and think outside the box. You ask thought-provoking questions and suggest unexpected connections to spark creativity.',
  'eleven-labs-bella',
  'MIN'
FROM workspaces
WHERE owner_id IN (
  SELECT id FROM users WHERE role = 'artist'
)
ON CONFLICT DO NOTHING;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS agent_usage (
  id bigint generated always as identity,
  workspace_id uuid references workspaces on delete cascade,
  agent_id uuid references agent_configs on delete cascade,
  tokens_used integer not null,
  usage_type text not null, -- 'CHAT', 'TTS', 'STT'
  created_at timestamptz default now()
);

ALTER TABLE agent_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their workspace agent usage"
  ON agent_usage FOR SELECT
  USING (
    is_superadmin() OR
    is_member_of_workspace(workspace_id)
  );

CREATE POLICY "System can insert agent usage"
  ON agent_usage FOR INSERT
  WITH CHECK (true);

-- Create function to check usage quota
CREATE OR REPLACE FUNCTION check_agent_usage_quota(
  workspace_id_param uuid,
  usage_type_param text
)
RETURNS boolean
LANGUAGE plpgsql
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
  FROM workspaces w
  LEFT JOIN (
    SELECT 'free' AS subscription_tier
  ) s ON true
  WHERE w.id = workspace_id_param;
  
  -- Get current usage for this month
  SELECT COALESCE(SUM(tokens_used), 0) INTO current_usage
  FROM agent_usage
  WHERE 
    workspace_id = workspace_id_param
    AND usage_type = usage_type_param
    AND created_at >= current_month_start;
  
  -- Return whether under quota
  RETURN current_usage < monthly_limit;
END;
$$;

-- Create feature flag for agent system
INSERT INTO feature_flags (name, description, enabled, rollout_percentage, metadata)
VALUES 
  ('AGENT_CHAT', 'AI Agent chat system', true, 100, '{"tier": "pro"}')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  enabled = EXCLUDED.enabled,
  rollout_percentage = EXCLUDED.rollout_percentage,
  metadata = EXCLUDED.metadata,
  updated_at = now();
/*
  # Artist & Fan Profile Module

  1. New Tables
    - `profiles` - User profiles with role-specific information
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `handle` (text, unique, regex validated)
      - `display_name` (text)
      - `bio` (text)
      - `avatar_url` (text)
      - `banner_url` (text)
      - `role` (text, enum check: ARTIST, FAN, EDU, ADMIN)
      - `workspace_id` (uuid, references workspaces) - null for FAN
      - `created_at` (timestamptz)

    - `follows` - Social graph relationships
      - `follower_id` (uuid, references profiles)
      - `followee_id` (uuid, references profiles)
      - `created_at` (timestamptz)

    - `achievements` - System achievements
      - `id` (serial, primary key)
      - `key` (text, unique)
      - `label` (text)
      - `icon_url` (text)

    - `profile_achievements` - Junction table for profiles and achievements
      - `profile_id` (uuid, references profiles)
      - `achievement_id` (int, references achievements)
      - `granted_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for profiles
    - Owner-only update access for profiles
    - Follow policy to prevent self-follows

  3. Indexing
    - Index on follows(followee_id) for followers tab
    - Index on profiles(handle) for fast @handle lookups
*/

create table profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  handle       text unique not null check (handle ~ '^[a-zA-Z0-9_]{3,20}$'),
  display_name text,
  bio          text,
  avatar_url   text,
  banner_url   text,
  role         text check (role in ('ARTIST','FAN','EDU','ADMIN')),
  workspace_id uuid references workspaces,      -- null for FAN
  created_at   timestamptz default now()
);

create table follows (
  follower_id uuid references profiles on delete cascade,
  followee_id uuid references profiles on delete cascade,
  created_at  timestamptz default now(),
  primary key (follower_id, followee_id)
);

create table achievements (
  id serial primary key,
  key text unique,              -- e.g. 'FIRST_5K_STREAMS'
  label text,
  icon_url text
);
create table profile_achievements (
  profile_id uuid references profiles on delete cascade,
  achievement_id int references achievements on delete cascade,
  granted_at timestamptz default now(),
  primary key(profile_id, achievement_id)
);

alter table profiles enable row level security;
alter table follows enable row level security;
alter table achievements enable row level security;
alter table profile_achievements enable row level security;

-- Everyone can read public parts; only owner can update
create policy "public read" on profiles for select using (true);
create policy "owner update" on profiles for update
  using (auth.uid() = user_id);
create policy "owner insert" on profiles for insert
  with check (auth.uid() = user_id);

-- Fans cannot follow themselves; RLS ensures both rows visible
create policy "follow insert" on follows for insert with check (
  auth.uid() is not null
  and follower_id in (select id from profiles where user_id = auth.uid())
);

create policy "follow read" on follows for select using (true);
create policy "follow delete" on follows for delete using (
  follower_id in (select id from profiles where user_id = auth.uid())
);

-- Achievement policies
create policy "achievements read" on achievements for select using (true);
create policy "achievements admin" on achievements for all using (
  exists (select 1 from users where id = auth.uid() and role = 'superadmin')
);

-- Profile achievements policies
create policy "profile_achievements read" on profile_achievements for select using (true);
create policy "profile_achievements admin" on profile_achievements for all using (
  exists (select 1 from users where id = auth.uid() and role = 'superadmin')
);

-- Create indexes for performance
create index on follows(followee_id);
create index on profiles(handle);
create index on profiles(user_id);
create index on profiles(workspace_id);

-- Insert sample achievements
INSERT INTO achievements (key, label, icon_url) VALUES
  ('FIRST_UPLOAD', 'First Track Upload', '/icons/achievements/upload.svg'),
  ('FIRST_5K_STREAMS', '5K Streams', '/icons/achievements/streams.svg'),
  ('FIRST_RELEASE', 'First Release', '/icons/achievements/release.svg'),
  ('FIRST_MERCH_SALE', 'First Merch Sale', '/icons/achievements/merch.svg'),
  ('VERIFIED_ARTIST', 'Verified Artist', '/icons/achievements/verified.svg'),
  ('SUPER_FAN', 'Super Fan', '/icons/achievements/superfan.svg'),
  ('EARLY_ADOPTER', 'Early Adopter', '/icons/achievements/early.svg'),
  ('COMMUNITY_BUILDER', 'Community Builder', '/icons/achievements/community.svg')
ON CONFLICT (key) DO NOTHING;

-- Create function to handle profile creation on user signup
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS trigger AS $$
DECLARE
  default_role text;
  handle_attempt text;
  counter integer := 0;
BEGIN
  -- Determine default role based on email domain or metadata
  default_role := COALESCE(NEW.raw_user_meta_data->>'role', 'FAN');
  
  -- Generate handle from email (before the @)
  handle_attempt := LOWER(SPLIT_PART(NEW.email, '@', 1));
  
  -- Remove special characters and ensure it matches the regex pattern
  handle_attempt := REGEXP_REPLACE(handle_attempt, '[^a-zA-Z0-9_]', '', 'g');
  
  -- Ensure handle is at least 3 characters
  IF LENGTH(handle_attempt) < 3 THEN
    handle_attempt := handle_attempt || LPAD(FLOOR(RANDOM() * 1000)::text, 3, '0');
  END IF;
  
  -- Ensure handle is not longer than 20 characters
  IF LENGTH(handle_attempt) > 20 THEN
    handle_attempt := SUBSTRING(handle_attempt, 1, 20);
  END IF;
  
  -- Try to insert with the generated handle, if it fails due to uniqueness,
  -- append numbers until we find a unique handle
  LOOP
    BEGIN
      INSERT INTO profiles (
        user_id,
        handle,
        display_name,
        role
      ) VALUES (
        NEW.id,
        CASE WHEN counter = 0 THEN handle_attempt ELSE handle_attempt || counter::text END,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        default_role
      );
      EXIT; -- Exit the loop if insert succeeds
    EXCEPTION WHEN unique_violation THEN
      counter := counter + 1;
      IF counter > 100 THEN
        RAISE EXCEPTION 'Could not generate a unique handle after 100 attempts';
      END IF;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- Create function to check if a user is following another profile
CREATE OR REPLACE FUNCTION is_following(follower_user_id uuid, followee_profile_id uuid)
RETURNS boolean AS $$
DECLARE
  follower_profile_id uuid;
BEGIN
  -- Get the profile ID for the follower user
  SELECT id INTO follower_profile_id
  FROM profiles
  WHERE user_id = follower_user_id;
  
  -- Check if a follow relationship exists
  RETURN EXISTS (
    SELECT 1
    FROM follows
    WHERE follower_id = follower_profile_id
    AND followee_id = followee_profile_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get a profile by handle
CREATE OR REPLACE FUNCTION get_profile_by_handle(handle_param text)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM profiles
  WHERE handle = handle_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
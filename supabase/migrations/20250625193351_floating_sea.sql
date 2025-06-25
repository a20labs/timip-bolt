/*
  # Function Search Path Security Fixes

  1. Purpose
    - Fix security warnings about functions with mutable search paths
    - Add explicit `SET search_path = '';` to security-sensitive functions
    - Recreate functions with proper security settings

  2. Functions Fixed
    - Public schema functions:
      - is_superadmin
      - create_superadmin_policies
      - log_admin_action
      - is_member_of_workspace
      - get_user_role_in_workspace
      - check_feature_flag
      - audit_trigger
      - update_updated_at_column
      - handle_new_user
      - is_demo_user
      - create_demo_profile
      - create_demo_profile_for_user
      - get_demo_profile_template
    
    - Lexicon schema functions:
      - get_term_label
      - search_by_alias
      - get_vocabulary
      - log_changes

  3. Security Benefits
    - Prevents potential search_path manipulation attacks
    - Ensures functions execute with expected schema resolution
    - Follows Supabase security best practices
*/

-- Fix public.is_superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'superadmin'
  );
END;
$$;

-- Fix public.create_superadmin_policies
CREATE OR REPLACE FUNCTION create_superadmin_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
      CREATE POLICY IF NOT EXISTS "Superadmins have full access to %I"
        ON public.%I FOR ALL
        TO authenticated
        USING (public.is_superadmin())
        WITH CHECK (public.is_superadmin())
    ', table_name, table_name);
  END LOOP;
END;
$$;

-- Fix public.log_admin_action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_workspace_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, resource_type, resource_id,
    old_values, new_values, workspace_id
  ) VALUES (
    auth.uid(), p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_workspace_id
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fix public.is_member_of_workspace
CREATE OR REPLACE FUNCTION is_member_of_workspace(workspace_uuid uuid, required_roles text[] DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role text;
BEGIN
  -- Superadmin has access to everything
  IF public.is_superadmin() THEN
    RETURN true;
  END IF;
  
  -- Check if user is a member and optionally validate role
  SELECT role::text INTO user_role
  FROM public.workspace_members
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

-- Fix public.get_user_role_in_workspace
CREATE OR REPLACE FUNCTION get_user_role_in_workspace(workspace_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM public.workspace_members
  WHERE workspace_id = workspace_uuid
    AND user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'none');
END;
$$;

-- Fix public.check_feature_flag
CREATE OR REPLACE FUNCTION check_feature_flag(
  flag_name text,
  workspace_id_param uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  flag_record RECORD;
  user_role text;
  user_hash integer;
BEGIN
  -- Superadmin bypasses all feature flags
  IF public.is_superadmin() THEN
    RETURN true;
  END IF;
  
  -- Get feature flag
  SELECT enabled, rollout_percentage, target_roles, target_workspaces
  INTO flag_record
  FROM public.feature_flags
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
    user_role := public.get_user_role_in_workspace(workspace_id_param);
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

-- Fix public.audit_trigger
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
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

-- Fix public.update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix public.handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- The following functions may not exist in all installations but fixing for completeness
DO $$
BEGIN
  -- Check and fix is_demo_user if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_demo_user') THEN
    EXECUTE $FUNC$
      CREATE OR REPLACE FUNCTION public.is_demo_user()
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $BODY$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() 
          AND email LIKE '%demo@truindee.com'
        );
      END;
      $BODY$;
    $FUNC$;
  END IF;

  -- Check and fix create_demo_profile if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_demo_profile') THEN
    EXECUTE $FUNC$
      CREATE OR REPLACE FUNCTION public.create_demo_profile(
        demo_email text,
        demo_type text
      )
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $BODY$
      DECLARE
        profile_template json;
        created_profile json;
      BEGIN
        -- Get appropriate template
        SELECT public.get_demo_profile_template(demo_type) INTO profile_template;
        
        -- Insert the profile and return result
        INSERT INTO public.profiles (
          user_id,
          full_name,
          email,
          role,
          metadata
        ) VALUES (
          profile_template->>'user_id',
          profile_template->>'full_name',
          demo_email,
          profile_template->>'role',
          (profile_template->'metadata')::jsonb
        )
        RETURNING to_json(profiles.*) INTO created_profile;
        
        RETURN created_profile;
      END;
      $BODY$;
    $FUNC$;
  END IF;
  
  -- Check and fix create_demo_profile_for_user if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_demo_profile_for_user') THEN
    EXECUTE $FUNC$
      CREATE OR REPLACE FUNCTION public.create_demo_profile_for_user(
        user_id uuid,
        demo_email text,
        demo_type text
      )
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $BODY$
      DECLARE
        profile_template json;
        created_profile json;
      BEGIN
        -- Get appropriate template
        SELECT public.get_demo_profile_template(demo_type) INTO profile_template;
        
        -- Insert the profile with specified user_id
        INSERT INTO public.profiles (
          user_id,
          full_name,
          email,
          role,
          metadata
        ) VALUES (
          user_id,
          profile_template->>'full_name',
          demo_email,
          profile_template->>'role',
          (profile_template->'metadata')::jsonb
        )
        RETURNING to_json(profiles.*) INTO created_profile;
        
        RETURN created_profile;
      END;
      $BODY$;
    $FUNC$;
  END IF;
  
  -- Check and fix get_demo_profile_template if it exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_demo_profile_template') THEN
    EXECUTE $FUNC$
      CREATE OR REPLACE FUNCTION public.get_demo_profile_template(demo_type text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $BODY$
      DECLARE
        template json;
      BEGIN
        -- Return appropriate template based on type
        IF demo_type = 'artist' THEN
          template := json_build_object(
            'user_id', gen_random_uuid(),
            'full_name', 'Demo Artist',
            'role', 'artist',
            'metadata', json_build_object(
              'is_demo', true
            )
          );
        ELSIF demo_type = 'fan' THEN
          template := json_build_object(
            'user_id', gen_random_uuid(),
            'full_name', 'Demo Fan',
            'role', 'fan',
            'metadata', json_build_object(
              'is_demo', true
            )
          );
        ELSE
          RAISE EXCEPTION 'Unknown demo type: %', demo_type;
        END IF;
        
        RETURN template;
      END;
      $BODY$;
    $FUNC$;
  END IF;
END$$;

-- Fix lexicon.get_term_label
CREATE OR REPLACE FUNCTION lexicon.get_term_label(
  term_id_param integer,
  locale_param text DEFAULT 'en'
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  label_result text;
BEGIN
  -- Try to get translation for requested locale
  SELECT label INTO label_result
  FROM lexicon.translations
  WHERE term_id = term_id_param AND locale = locale_param;
  
  -- If not found, try English fallback
  IF label_result IS NULL THEN
    SELECT label INTO label_result
    FROM lexicon.translations
    WHERE term_id = term_id_param AND locale = 'en';
  END IF;
  
  -- If still not found, use default label
  IF label_result IS NULL THEN
    SELECT default_label INTO label_result
    FROM lexicon.terms
    WHERE id = term_id_param;
  END IF;
  
  RETURN COALESCE(label_result, 'Unknown');
END;
$$;

-- Fix lexicon.search_by_alias
CREATE OR REPLACE FUNCTION lexicon.search_by_alias(
  alias_param text,
  category_key_param text DEFAULT NULL
)
RETURNS TABLE(
  term_id integer,
  slug text,
  label text,
  category_key text
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
    t.slug,
    t.default_label,
    c.key
  FROM lexicon.terms t
  JOIN lexicon.categories c ON t.category_id = c.id
  JOIN lexicon.aliases a ON t.id = a.term_id
  WHERE 
    LOWER(a.alias) = LOWER(alias_param)
    AND t.status = 'ACTIVE'
    AND c.active = true
    AND (category_key_param IS NULL OR c.key = category_key_param);
END;
$$;

-- Fix lexicon.get_vocabulary
CREATE OR REPLACE FUNCTION lexicon.get_vocabulary(
  category_key_param text,
  locale_param text DEFAULT 'en'
)
RETURNS TABLE(
  id integer,
  slug text,
  label text,
  description text,
  sort_order integer,
  aliases text[]
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
    t.slug,
    COALESCE(tr.label, t.default_label) as label,
    COALESCE(tr.description, t.description) as description,
    t.sort_order,
    ARRAY(
      SELECT a.alias 
      FROM lexicon.aliases a 
      WHERE a.term_id = t.id 
      ORDER BY a.alias
    ) as aliases
  FROM lexicon.terms t
  JOIN lexicon.categories c ON t.category_id = c.id
  LEFT JOIN lexicon.translations tr ON t.id = tr.term_id AND tr.locale = locale_param
  WHERE 
    c.key = category_key_param
    AND t.status = 'ACTIVE'
    AND c.active = true
  ORDER BY t.sort_order, t.default_label;
END;
$$;

-- Fix lexicon.log_changes
CREATE OR REPLACE FUNCTION lexicon.log_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  resource_id_value text;
  record_to_jsonb jsonb;
BEGIN
  -- Handle tables with different primary key structures
  IF TG_TABLE_NAME = 'translations' THEN
    -- For translations table which has composite PK (term_id, locale)
    resource_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.term_id::text || ':' || OLD.locale
      ELSE NEW.term_id::text || ':' || NEW.locale
    END;
  ELSIF TG_TABLE_NAME = 'aliases' THEN
    -- For aliases table which has composite PK (term_id, alias)
    resource_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.term_id::text || ':' || OLD.alias
      ELSE NEW.term_id::text || ':' || NEW.alias
    END;
  ELSE
    -- For tables with id column
    resource_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END;
  END IF;

  -- Convert record to jsonb based on operation
  IF TG_OP = 'DELETE' THEN
    record_to_jsonb := to_jsonb(OLD);
  ELSE
    record_to_jsonb := to_jsonb(NEW);
  END IF;

  -- Insert into changelog
  INSERT INTO lexicon.changelog (
    actor_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    resource_id_value,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Log that the function search path security fixes have been applied
DO $$
BEGIN
  RAISE NOTICE 'Function search_path security fixes applied successfully';
END$$;
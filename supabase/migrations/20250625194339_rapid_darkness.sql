-- Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Check if vector extension exists in public schema and handle it
DO $$
DECLARE
  extension_exists BOOLEAN;
  is_in_public BOOLEAN;
BEGIN
  -- Check if the extension exists and is in public schema
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) INTO extension_exists;
  
  IF extension_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_extension e
      JOIN pg_namespace n ON e.extnamespace = n.oid
      WHERE e.extname = 'vector' AND n.nspname = 'public'
    ) INTO is_in_public;
    
    IF is_in_public THEN
      -- Extension exists in public schema, try to move it
      RAISE NOTICE 'Moving vector extension from public schema to extensions schema';
      
      -- Try ALTER EXTENSION... SET SCHEMA approach
      BEGIN
        ALTER EXTENSION vector SET SCHEMA extensions;
        RAISE NOTICE 'Successfully moved vector extension to extensions schema';
      EXCEPTION WHEN OTHERS THEN
        -- If ALTER EXTENSION fails (non-relocatable extension)
        RAISE NOTICE 'Could not directly move extension. Using alternative approach.';
        
        -- Create extension in the extensions schema (requires dropping first)
        -- WARNING: This approach may require additional steps to recreate tables with vector columns
        RAISE WARNING 'Vector extension will need to be reinstalled in extensions schema. This may require recreation of tables with vector columns.';
        RAISE WARNING 'Run the following commands manually after backing up your data:';
        RAISE WARNING '1. DROP EXTENSION vector CASCADE;';
        RAISE WARNING '2. CREATE EXTENSION vector WITH SCHEMA extensions;';
        RAISE WARNING '3. Recreate tables with vector columns referencing extensions.vector';
      END;
    ELSE
      RAISE NOTICE 'Vector extension already exists but not in public schema';
    END IF;
  ELSE
    -- Extension doesn't exist, create it in the extensions schema
    RAISE NOTICE 'Vector extension not found, creating in extensions schema';
    CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
  END IF;
  
  -- Add extensions schema to the database search_path for easier usage
  -- This allows using 'vector' without schema qualification
  -- but is still safer than having the extension in public
  ALTER DATABASE CURRENT SET search_path = "$user", public, extensions;
END $$;

-- Note about fixing existing tables
COMMENT ON SCHEMA extensions IS 'Schema for safely storing extensions outside of public schema';
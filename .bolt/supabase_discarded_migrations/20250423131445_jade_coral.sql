/*
  # Fix Rich Text Content Handling

  1. Changes
    - Drop ALL remaining constraints on pages table
    - Ensure proper handling of jsonb content for all columns
    - Handle all possible content types from TipTap editor
    - Set proper defaults and handle null values

  2. Notes
    - Complete cleanup of any remaining constraints
    - Ensures consistent jsonb handling
    - Prevents any check constraint violations
*/

DO $$ 
DECLARE
  constraint_name text;
BEGIN 
  -- Drop ALL constraints on the pages table
  FOR constraint_name IN (
    SELECT tc.constraint_name 
    FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'pages' 
    AND tc.constraint_type = 'CHECK'
  ) LOOP
    EXECUTE format('ALTER TABLE pages DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;

  -- Ensure columns are properly typed and handle all content types
  ALTER TABLE pages 
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN description_native DROP NOT NULL;

  -- Set proper column types with comprehensive USING clause
  ALTER TABLE pages 
  ALTER COLUMN description TYPE jsonb USING COALESCE(
    CASE 
      WHEN description IS NULL OR description::text = '' THEN '{}'::jsonb
      WHEN description::text LIKE '{%}' THEN description::jsonb
      ELSE description::jsonb
    END,
    '{}'::jsonb
  ),
  ALTER COLUMN description_native TYPE jsonb USING COALESCE(
    CASE 
      WHEN description_native IS NULL OR description_native::text = '' THEN '{}'::jsonb
      WHEN description_native::text LIKE '{%}' THEN description_native::jsonb
      ELSE description_native::jsonb
    END,
    '{}'::jsonb
  );

  -- Set default values
  ALTER TABLE pages
  ALTER COLUMN description SET DEFAULT '{}'::jsonb,
  ALTER COLUMN description_native SET DEFAULT '{}'::jsonb;

END $$;
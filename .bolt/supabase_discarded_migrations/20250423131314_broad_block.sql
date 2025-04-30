/*
  # Fix Rich Text Content Handling

  1. Changes
    - Remove any remaining constraints that could affect rich text content
    - Ensure all text columns properly handle jsonb content
    - Add proper handling for all TipTap editor content types
    - Set appropriate defaults for jsonb columns

  2. Notes
    - Handles all rich text content types (headings, paragraphs, etc.)
    - Ensures consistent jsonb storage
    - Removes any character limits
*/

DO $$ 
BEGIN 
  -- Drop any remaining constraints that might affect rich text content
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'pages'
    AND constraint_type = 'CHECK'
  ) THEN
    -- Drop all check constraints on pages table
    EXECUTE (
      SELECT string_agg('ALTER TABLE pages DROP CONSTRAINT ' || quote_ident(constraint_name), '; ')
      FROM information_schema.table_constraints
      WHERE table_name = 'pages'
      AND constraint_type = 'CHECK'
    );
  END IF;

  -- Ensure description columns are properly typed as jsonb
  ALTER TABLE pages 
  ALTER COLUMN description TYPE jsonb USING 
    CASE 
      WHEN description IS NULL THEN '{}'::jsonb
      WHEN description::text = '' THEN '{}'::jsonb
      WHEN description::text LIKE '{%}' THEN description::jsonb
      ELSE json_build_object(
        'type', 'doc',
        'content', ARRAY[json_build_object(
          'type', 'paragraph',
          'content', ARRAY[json_build_object(
            'type', 'text',
            'text', description::text
          )]
        )]
      )::jsonb
    END,
  ALTER COLUMN description_native TYPE jsonb USING 
    CASE 
      WHEN description_native IS NULL THEN '{}'::jsonb
      WHEN description_native::text = '' THEN '{}'::jsonb
      WHEN description_native::text LIKE '{%}' THEN description_native::jsonb
      ELSE json_build_object(
        'type', 'doc',
        'content', ARRAY[json_build_object(
          'type', 'paragraph',
          'content', ARRAY[json_build_object(
            'type', 'text',
            'text', description_native::text
          )]
        )]
      )::jsonb
    END;

  -- Set default values
  ALTER TABLE pages
  ALTER COLUMN description SET DEFAULT '{}'::jsonb,
  ALTER COLUMN description_native SET DEFAULT '{}'::jsonb;

END $$;
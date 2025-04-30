/*
  # Fix Description Constraints

  1. Changes
    - Drop any remaining check constraints on description fields
    - Ensure both description and description_native are properly typed as jsonb
    - Add proper default values
    - Add explicit constraint existence check

  2. Notes
    - Using DO block for safe operations
    - Setting proper jsonb defaults
    - Ensuring idempotent operations
    - Added explicit constraint check to ensure removal
*/

DO $$ 
BEGIN 
  -- First check if the constraint exists and drop it if it does
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'pages_description_native_check'
    AND table_name = 'pages'
  ) THEN
    ALTER TABLE pages DROP CONSTRAINT pages_description_native_check;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'pages_description_check'
    AND table_name = 'pages'
  ) THEN
    ALTER TABLE pages DROP CONSTRAINT pages_description_check;
  END IF;

  -- Update column types and defaults with explicit COALESCE to handle nulls
  ALTER TABLE pages 
  ALTER COLUMN description TYPE jsonb USING COALESCE(
    CASE 
      WHEN description IS NULL OR description::text = '' THEN '{}'::jsonb
      ELSE description::jsonb
    END,
    '{}'::jsonb
  ),
  ALTER COLUMN description_native TYPE jsonb USING COALESCE(
    CASE 
      WHEN description_native IS NULL OR description_native::text = '' THEN '{}'::jsonb
      ELSE description_native::jsonb
    END,
    '{}'::jsonb
  );

  -- Set default values
  ALTER TABLE pages
  ALTER COLUMN description SET DEFAULT '{}'::jsonb,
  ALTER COLUMN description_native SET DEFAULT '{}'::jsonb;
END $$;
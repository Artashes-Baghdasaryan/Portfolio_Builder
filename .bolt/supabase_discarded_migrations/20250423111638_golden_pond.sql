/*
  # Fix Description Constraints

  1. Changes
    - Drop any remaining check constraints on description fields
    - Ensure both description and description_native are properly typed as jsonb
    - Add proper default values

  2. Notes
    - Using DO block for safe operations
    - Setting proper jsonb defaults
    - Ensuring idempotent operations
*/

DO $$ 
BEGIN 
  -- Drop any remaining check constraints
  ALTER TABLE pages 
  DROP CONSTRAINT IF EXISTS pages_description_check,
  DROP CONSTRAINT IF EXISTS pages_description_native_check;

  -- Update column types and defaults
  ALTER TABLE pages 
  ALTER COLUMN description TYPE jsonb USING CASE 
    WHEN description IS NULL THEN '{}'::jsonb
    WHEN description::text = '' THEN '{}'::jsonb
    ELSE description::jsonb
  END,
  ALTER COLUMN description_native TYPE jsonb USING CASE 
    WHEN description_native IS NULL THEN '{}'::jsonb
    WHEN description_native::text = '' THEN '{}'::jsonb
    ELSE description_native::jsonb
  END;

  -- Set default values
  ALTER TABLE pages
  ALTER COLUMN description SET DEFAULT '{}'::jsonb,
  ALTER COLUMN description_native SET DEFAULT '{}'::jsonb;
END $$;
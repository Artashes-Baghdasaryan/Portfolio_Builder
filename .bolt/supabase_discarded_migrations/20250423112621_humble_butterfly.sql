/*
  # Fix sections content columns

  1. Changes
    - Update content and content_native columns in sections table to use jsonb type
    - Set default values to empty JSON object
    - Remove any existing constraints
    - Ensure proper JSON conversion for existing data

  2. Notes
    - Similar to pages table fix
    - Ensures consistent JSON storage
    - Prevents invalid content issues
*/

DO $$ 
BEGIN 
  -- Update column types and defaults
  ALTER TABLE sections 
  ALTER COLUMN content TYPE jsonb USING CASE 
    WHEN content IS NULL THEN '{}'::jsonb
    WHEN content::text = '' THEN '{}'::jsonb
    ELSE content::jsonb
  END,
  ALTER COLUMN content_native TYPE jsonb USING CASE 
    WHEN content_native IS NULL THEN '{}'::jsonb
    WHEN content_native::text = '' THEN '{}'::jsonb
    ELSE content_native::jsonb
  END;

  -- Set default values
  ALTER TABLE sections
  ALTER COLUMN content SET DEFAULT '{}'::jsonb,
  ALTER COLUMN content_native SET DEFAULT '{}'::jsonb;
END $$;
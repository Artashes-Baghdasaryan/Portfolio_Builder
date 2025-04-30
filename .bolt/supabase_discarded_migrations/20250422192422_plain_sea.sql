/*
  # Fix Description Content Columns

  1. Changes
    - Drop and recreate description_content columns with proper jsonb type
    - Ensure proper default values are set
    - Use DO block for safe column management

  2. Notes
    - Using DO block to safely handle column operations
    - Setting proper jsonb defaults
    - Ensuring idempotent operations
*/

DO $$ 
BEGIN 
  -- Drop existing columns if they exist
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'description_content'
  ) THEN
    ALTER TABLE pages DROP COLUMN description_content;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'pages' 
    AND column_name = 'description_content_native'
  ) THEN
    ALTER TABLE pages DROP COLUMN description_content_native;
  END IF;

  -- Add columns with proper type and default
  ALTER TABLE pages 
    ADD COLUMN description_content jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN description_content_native jsonb DEFAULT '{}'::jsonb;
END $$;
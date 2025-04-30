/*
  # Add updated_at column to sections table

  1. Changes
    - Add `updated_at` column to `sections` table with timestamp type and default value
    - This column is needed for the existing trigger `update_sections_updated_at`

  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Sets default value to match created_at for existing rows
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'sections' 
    AND column_name = 'updated_at'
  ) THEN 
    ALTER TABLE sections 
    ADD COLUMN updated_at timestamptz DEFAULT timezone('utc'::text, now());
  END IF;
END $$;
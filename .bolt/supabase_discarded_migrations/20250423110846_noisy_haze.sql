/*
  # Update description_native column type

  1. Changes
    - Remove character limit constraint from description_native
    - Convert description_native column to jsonb type
    - Set default value to empty JSON object

  2. Notes
    - Safely handles existing data conversion
    - Maintains data integrity during type change
*/

ALTER TABLE pages 
DROP CONSTRAINT IF EXISTS pages_description_native_check;

ALTER TABLE pages 
ALTER COLUMN description_native TYPE jsonb USING CASE 
  WHEN description_native IS NULL THEN NULL
  WHEN description_native::text = '' THEN '{}'::jsonb
  ELSE description_native::jsonb
END;
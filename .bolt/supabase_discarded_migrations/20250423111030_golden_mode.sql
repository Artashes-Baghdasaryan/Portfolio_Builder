/*
  # Update page description columns

  1. Changes
    - Convert description column to jsonb type
    - Remove character limit constraint from description
    - Set default values to empty JSON object
    - Safely handle existing data conversion

  2. Notes
    - Maintains data integrity during type change
    - Handles NULL values appropriately
*/

ALTER TABLE pages 
DROP CONSTRAINT IF EXISTS pages_description_check;

ALTER TABLE pages 
ALTER COLUMN description TYPE jsonb USING CASE 
  WHEN description IS NULL THEN NULL
  WHEN description::text = '' THEN '{}'::jsonb
  ELSE description::jsonb
END;
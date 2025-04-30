/*
  # Update page description fields

  1. Changes
    - Add `only_for_admin` column to pages table with default value of false
*/

ALTER TABLE pages
ADD COLUMN only_for_admin boolean DEFAULT false;
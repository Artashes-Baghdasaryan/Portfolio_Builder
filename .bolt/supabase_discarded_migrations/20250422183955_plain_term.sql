/*
  # Add show_in_main_page field to sections

  1. Changes
    - Add `show_in_main_page` boolean field to sections table with default value of false
*/

ALTER TABLE sections
ADD COLUMN show_in_main_page boolean DEFAULT false;
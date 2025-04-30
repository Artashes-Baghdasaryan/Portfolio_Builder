/*
  # Add Additional Social Media Links

  1. Changes
    - Add new social media URL fields to portfolio_content table
    - All fields are optional text columns
    - Includes popular professional and content platforms
*/

ALTER TABLE portfolio_content
ADD COLUMN google_scholar_url text,
ADD COLUMN stackoverflow_url text,
ADD COLUMN orcid_url text,
ADD COLUMN medium_url text,
ADD COLUMN gumroad_url text,
ADD COLUMN substack_url text,
ADD COLUMN dev_to_url text,
ADD COLUMN hashnode_url text,
ADD COLUMN youtube_url text,
ADD COLUMN personal_website_url text;
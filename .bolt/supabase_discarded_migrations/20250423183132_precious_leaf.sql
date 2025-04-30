/*
  # Add More Social Media Links

  1. Changes
    - Add Facebook, Instagram, TikTok, and VKontakte URL fields to portfolio_content table
    - All fields are optional text columns
*/

ALTER TABLE portfolio_content
ADD COLUMN facebook_url text,
ADD COLUMN instagram_url text,
ADD COLUMN tiktok_url text,
ADD COLUMN vk_url text;
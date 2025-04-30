/*
  # Add Featured Projects and Contact Section Fields

  1. Changes
    - Add featured_projects_title and featured_projects_title_native for the "Featured Projects" section
    - Add contact_title, contact_title_native, contact_text, and contact_text_native for the "Let's Work Together" section

  2. Notes
    - All fields are optional text fields
    - Native language fields allow for bilingual support
*/

ALTER TABLE portfolio_content
ADD COLUMN featured_projects_title text DEFAULT 'Featured Projects',
ADD COLUMN featured_projects_title_native text DEFAULT 'Ընտրված նախագծեր',
ADD COLUMN contact_title text DEFAULT 'Let''s Work Together',
ADD COLUMN contact_title_native text DEFAULT 'Եկեք աշխատենք միասին',
ADD COLUMN contact_text text DEFAULT 'I''m always interested in hearing about new projects and opportunities. Whether you have a question or just want to say hi, feel free to reach out!',
ADD COLUMN contact_text_native text DEFAULT 'Ես միշտ հետաքրքրված եմ նոր նախագծերի և հնարավորությունների մասին լսելով: Անկախ նրանից, թե հարց ունեք, թե պարզապես ցանկանում եք բարևել, ազատ զգացեք կապվել ինձ հետ:';
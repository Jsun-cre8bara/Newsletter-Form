-- Fix existing posts with Korean slugs
-- Run this in Supabase SQL Editor

-- Update posts with Korean slugs to use timestamp-based slugs
UPDATE posts
SET slug = CONCAT('post-', EXTRACT(EPOCH FROM created_at)::bigint * 1000)
WHERE slug ~ '[가-힣]'
OR slug = ''
OR slug IS NULL;

-- Verify the changes
SELECT id, title, slug, created_at
FROM posts
ORDER BY created_at DESC;

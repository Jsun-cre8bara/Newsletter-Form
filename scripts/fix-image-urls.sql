-- 포스트 이미지 URL 수정 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 이미지 파일명 매칭:
-- 01_kim.jpg → 1770869412569-4f87fi.jpg
-- 02_kim.jpg → 1770869502060-zppflc.jpg
-- 03_kim.jpg → 1770869563419-pmpisk.jpg
-- 04_kim.jpg → 1770869558293-gxu2e8.jpg
-- 05_kim.jpg → 1770869532678-1rahev.jpg
-- 06_kim.jpg → 1770869548704-h6qqbf.jpg

-- Supabase Storage 기본 URL
-- https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/

-- ============================================
-- 1. thumbnail_url 수정
-- ============================================

-- 01_kim.jpg → 1770869412569-4f87fi.jpg
UPDATE posts
SET thumbnail_url = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869412569-4f87fi.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%01_kim%'
   OR thumbnail_url LIKE '%1770869412569-4f87fi%';

-- 02_kim.jpg → 1770869502060-zppflc.jpg
UPDATE posts
SET thumbnail_url = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869502060-zppflc.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%02_kim%'
   OR thumbnail_url LIKE '%1770869502060-zppflc%';

-- 03_kim.jpg → 1770869563419-pmpisk.jpg
UPDATE posts
SET thumbnail_url = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869563419-pmpisk.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%03_kim%'
   OR thumbnail_url LIKE '%1770869563419-pmpisk%';

-- 04_kim.jpg → 1770869558293-gxu2e8.jpg
UPDATE posts
SET thumbnail_url = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869558293-gxu2e8.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%04_kim%'
   OR thumbnail_url LIKE '%1770869558293-gxu2e8%';

-- 05_kim.jpg → 1770869532678-1rahev.jpg
UPDATE posts
SET thumbnail_url = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869532678-1rahev.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%05_kim%'
   OR thumbnail_url LIKE '%1770869532678-1rahev%';

-- 06_kim.jpg → 1770869548704-h6qqbf.jpg
UPDATE posts
SET thumbnail_url = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869548704-h6qqbf.jpg',
    updated_at = NOW()
WHERE thumbnail_url LIKE '%06_kim%'
   OR thumbnail_url LIKE '%1770869548704-h6qqbf%';

-- ============================================
-- 2. 본문(content)의 이미지 링크 수정
-- ============================================

-- 로컬 경로나 잘못된 URL을 올바른 Storage URL로 교체

-- 01_kim.jpg → 1770869412569-4f87fi.jpg
UPDATE posts
SET content = REPLACE(
    REPLACE(
        content,
        'img_upload/부르키나파소/0212/01_kim.jpg',
        'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869412569-4f87fi.jpg'
    ),
    '![01_kim](',
    '![01_kim](https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869412569-4f87fi.jpg'
),
updated_at = NOW()
WHERE content LIKE '%01_kim%';

-- 02_kim.jpg → 1770869502060-zppflc.jpg
UPDATE posts
SET content = REPLACE(
    REPLACE(
        content,
        'img_upload/부르키나파소/0212/02_kim.jpg',
        'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869502060-zppflc.jpg'
    ),
    '![02_kim](',
    '![02_kim](https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869502060-zppflc.jpg'
),
updated_at = NOW()
WHERE content LIKE '%02_kim%';

-- 03_kim.jpg → 1770869563419-pmpisk.jpg
UPDATE posts
SET content = REPLACE(
    REPLACE(
        content,
        'img_upload/부르키나파소/0212/03_kim.jpg',
        'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869563419-pmpisk.jpg'
    ),
    '![03_kim](',
    '![03_kim](https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869563419-pmpisk.jpg'
),
updated_at = NOW()
WHERE content LIKE '%03_kim%';

-- 04_kim.jpg → 1770869558293-gxu2e8.jpg
UPDATE posts
SET content = REPLACE(
    REPLACE(
        content,
        'img_upload/부르키나파소/0212/04_kim.jpg',
        'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869558293-gxu2e8.jpg'
    ),
    '![04_kim](',
    '![04_kim](https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869558293-gxu2e8.jpg'
),
updated_at = NOW()
WHERE content LIKE '%04_kim%';

-- 05_kim.jpg → 1770869532678-1rahev.jpg
UPDATE posts
SET content = REPLACE(
    REPLACE(
        content,
        'img_upload/부르키나파소/0212/05_kim.jpg',
        'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869532678-1rahev.jpg'
    ),
    '![05_kim](',
    '![05_kim](https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869532678-1rahev.jpg'
),
updated_at = NOW()
WHERE content LIKE '%05_kim%';

-- 06_kim.jpg → 1770869548704-h6qqbf.jpg
UPDATE posts
SET content = REPLACE(
    REPLACE(
        content,
        'img_upload/부르키나파소/0212/06_kim.jpg',
        'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869548704-h6qqbf.jpg'
    ),
    '![06_kim](',
    '![06_kim](https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images/1770869548704-h6qqbf.jpg'
),
updated_at = NOW()
WHERE content LIKE '%06_kim%';

-- ============================================
-- 3. 업데이트 결과 확인
-- ============================================

-- thumbnail_url 확인
SELECT 
    id,
    title,
    thumbnail_url,
    updated_at
FROM posts
WHERE thumbnail_url LIKE '%1770869412569-4f87fi%'
   OR thumbnail_url LIKE '%1770869502060-zppflc%'
   OR thumbnail_url LIKE '%1770869563419-pmpisk%'
   OR thumbnail_url LIKE '%1770869558293-gxu2e8%'
   OR thumbnail_url LIKE '%1770869532678-1rahev%'
   OR thumbnail_url LIKE '%1770869548704-h6qqbf%'
ORDER BY updated_at DESC;

-- 본문에 이미지 링크가 있는 포스트 확인
SELECT 
    id,
    title,
    LEFT(content, 200) as content_preview
FROM posts
WHERE content LIKE '%1770869412569-4f87fi%'
   OR content LIKE '%1770869502060-zppflc%'
   OR content LIKE '%1770869563419-pmpisk%'
   OR content LIKE '%1770869558293-gxu2e8%'
   OR content LIKE '%1770869532678-1rahev%'
   OR content LIKE '%1770869548704-h6qqbf%'
ORDER BY updated_at DESC;

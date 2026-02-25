-- 본문에서 중복된 URL 제거하기
-- 패턴: ![텍스트](URL1 URL2) -> ![텍스트](URL2)

-- 먼저 현재 상태 확인
SELECT id, title, LEFT(content, 200) as content_preview
FROM posts
WHERE content LIKE '%https://%https://%';

-- 중복 URL 제거 (두 번째 URL만 남기기)
-- 예: ![01_kim](https://...jpg https://...jpg) -> ![01_kim](https://...jpg)
UPDATE posts
SET content = REGEXP_REPLACE(
  content,
  '!\[([^\]]*)\]\(https://[^ )]*\s+(https://[^)]+)\)',
  '![\1](\2)',
  'g'
)
WHERE content LIKE '%https://%https://%';

-- 결과 확인
SELECT id, title, LEFT(content, 200) as content_preview
FROM posts;

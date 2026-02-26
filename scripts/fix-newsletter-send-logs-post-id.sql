-- newsletter_send_logs 테이블의 post_id 컬럼을 nullable로 변경
-- 커스텀 뉴스레터는 post_id가 없을 수 있으므로

-- 1. 먼저 현재 상태 확인
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'newsletter_send_logs' 
AND column_name = 'post_id';

-- 2. post_id 컬럼을 nullable로 변경
ALTER TABLE newsletter_send_logs 
  ALTER COLUMN post_id DROP NOT NULL;

-- 3. 변경 확인
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'newsletter_send_logs' 
AND column_name = 'post_id';

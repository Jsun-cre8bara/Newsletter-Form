-- 뉴스레터 발송 이력 테이블 업데이트
-- 커스텀 뉴스레터를 위해 post_id를 nullable로 변경

-- post_id를 nullable로 변경
ALTER TABLE newsletter_send_logs 
  ALTER COLUMN post_id DROP NOT NULL;

-- 인덱스는 그대로 유지 (null 값도 인덱싱됨)

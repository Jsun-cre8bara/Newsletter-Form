-- 뉴스레터 발송 이력 테이블 생성 (post_id nullable 버전)
-- Supabase SQL Editor에서 실행하세요

-- 테이블 생성 (post_id를 nullable로)
CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID,  -- nullable (커스텀 뉴스레터를 위해)
  post_title TEXT NOT NULL,
  post_url TEXT NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS newsletter_send_logs_sent_at_idx
  ON newsletter_send_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS newsletter_send_logs_post_id_idx
  ON newsletter_send_logs(post_id);

-- 기존 테이블이 있고 post_id가 NOT NULL인 경우 nullable로 변경
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'newsletter_send_logs' 
    AND column_name = 'post_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE newsletter_send_logs 
      ALTER COLUMN post_id DROP NOT NULL;
  END IF;
END $$;

-- 뉴스레터 발송 이력 테이블
CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  post_title TEXT NOT NULL,
  post_url TEXT NOT NULL,
  total_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS newsletter_send_logs_sent_at_idx
  ON newsletter_send_logs(sent_at DESC);

CREATE INDEX IF NOT EXISTS newsletter_send_logs_post_id_idx
  ON newsletter_send_logs(post_id);

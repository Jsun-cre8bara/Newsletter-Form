-- Newsletter Blog Database Setup
-- Supabase SQL Editor에서 실행하세요

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  read_time TEXT DEFAULT '5분 읽기',
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Header Config Table
CREATE TABLE IF NOT EXISTS header_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  main_title TEXT NOT NULL,
  main_description TEXT NOT NULL,
  main_image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Admin Users Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE header_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Posts Policies
-- 모든 사용자가 게시된 포스트를 읽을 수 있음
CREATE POLICY "Anyone can read published posts" ON posts
  FOR SELECT USING (published = TRUE);

-- 인증된 사용자(관리자)만 모든 포스트를 읽을 수 있음
CREATE POLICY "Authenticated users can read all posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- 인증된 사용자만 포스트를 생성할 수 있음
CREATE POLICY "Authenticated users can create posts" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 포스트를 수정할 수 있음
CREATE POLICY "Authenticated users can update posts" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자만 포스트를 삭제할 수 있음
CREATE POLICY "Authenticated users can delete posts" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Subscribers Policies
-- 모든 사용자가 구독 신청할 수 있음
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (TRUE);

-- 인증된 사용자만 구독자 목록을 볼 수 있음
CREATE POLICY "Authenticated users can read subscribers" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Header Config Policies
-- 모든 사용자가 헤더 설정을 읽을 수 있음
CREATE POLICY "Anyone can read header config" ON header_config
  FOR SELECT USING (TRUE);

-- 인증된 사용자만 헤더 설정을 수정할 수 있음
CREATE POLICY "Authenticated users can update header config" ON header_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can modify header config" ON header_config
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Admin Users Policies
-- 인증된 사용자만 관리자 목록을 볼 수 있음
CREATE POLICY "Authenticated users can read admin users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS subscribers_email_idx ON subscribers(email);
CREATE INDEX IF NOT EXISTS subscribers_active_idx ON subscribers(active);

-- Insert default header config (optional)
INSERT INTO header_config (main_title, main_description, main_image_url)
VALUES (
  '최신 웹 개발 트렌드 2026',
  '웹 개발에 관한 최신 트렌드와 기술 스택에 대해 알아봅니다. React, TypeScript, 그리고 최신 프레임워크까지.',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop'
)
ON CONFLICT DO NOTHING;

-- Sample Posts (optional - 테스트용)
INSERT INTO posts (title, description, content, category, read_time, slug, published, thumbnail_url)
VALUES 
(
  '최신 웹 개발 트렌드 2026',
  '웹 개발에 관한 최신 트렌드와 기술 스택에 대해 알아봅니다. React, TypeScript, 그리고 최신 프레임워크까지.',
  '# 웹 개발 트렌드

2026년 웹 개발은 더욱 흥미진진해지고 있습니다.

## React의 진화

React 19가 출시되면서 더욱 강력해진 기능들을 제공합니다.

## TypeScript의 중요성

타입 안정성은 이제 선택이 아닌 필수입니다.',
  '개발',
  '5분 읽기',
  'web-development-trends-2026',
  TRUE,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
),
(
  '창의적인 디자인 시스템 구축하기',
  '애자일 개발 프로세스를 실무에 적용하는 실용적인 가이드입니다.',
  '# 디자인 시스템

효과적인 디자인 시스템 구축 방법을 알아봅니다.

## 컴포넌트 설계

재사용 가능한 컴포넌트 설계가 핵심입니다.',
  '디자인',
  '8분 읽기',
  'creative-design-system',
  TRUE,
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'
),
(
  '팀 협업을 위한 애자일 방법론',
  '애자일 개발 프로세스를 실무에 적용하는 실용적인 가이드입니다.',
  '# 애자일 방법론

팀 협업을 개선하는 애자일 방법론을 소개합니다.',
  '협업',
  '8분 읽기',
  'agile-methodology',
  TRUE,
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop'
),
(
  '효율적인 원격 근무 환경 만들기',
  'AI와 디자인 기술의 창작 활동에 미치는 영향과 가능성을 설펴봅니다.',
  '# 원격 근무

효율적인 원격 근무 환경을 구축하는 방법을 알아봅니다.',
  '생산성',
  '5분 읽기',
  'remote-work-environment',
  TRUE,
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop'
),
(
  '디지털 아트의 미래',
  'AI와 디지털 기술이 창작 활동에 미치는 영향과 가능성을 살펴봅니다.',
  '# 디지털 아트

디지털 아트의 미래를 예측해봅니다.',
  '기술',
  '5분 읽기',
  'digital-art-future',
  TRUE,
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=600&fit=crop'
),
(
  '미니멀리즘과 사용자 경험',
  '미니멀한 디자인으로 더 나은 사용자 경험을 제공하는 방법을 알아봅니다.',
  '# UX 디자인

미니멀리즘이 UX에 미치는 영향을 분석합니다.',
  'UX',
  '5분 읽기',
  'minimalism-ux',
  TRUE,
  'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop'
)
ON CONFLICT DO NOTHING;

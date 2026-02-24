# 뉴스레터 블로그 📰

Next.js 14 + Supabase로 구축한 현대적인 블로그 플랫폼입니다.

## ✨ 주요 기능

### 퍼블릭 페이지
- 🎨 Hero 헤더 (커스터마이징 가능한 이미지 + 텍스트)
- 📝 최신 포스트 6개 그리드 레이아웃
- 📧 뉴스레터 구독 폼
- 📱 완전 반응형 디자인

### 관리자 대시보드
- 📊 대시보드 (통계, 최근 포스트)
- ✍️ 포스트 CRUD (작성/수정/삭제)
- 🖼️ 이미지 업로드 (Supabase Storage)
- 🎯 헤더 설정 (제목, 설명, 이미지)
- 👥 구독자 관리 (목록, CSV 내보내기)

## 🚀 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Form**: React Hook Form
- **Icons**: Lucide React
- **Markdown**: React Markdown

## 📦 설치 방법

### 1. 패키지 설치

\`\`\`bash
npm install
\`\`\`

### 2. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. 새 프로젝트 생성
3. Settings → API에서 다음 정보 복사:
   - Project URL
   - anon public key
   - service_role key

### 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

자세한 내용은 `ENV_SETUP.md` 참고

### 4. 데이터베이스 설정

1. Supabase 대시보드 → SQL Editor
2. `supabase_setup.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행
4. 테이블 4개 + 샘플 데이터 생성 확인

### 5. Storage 버킷 생성

1. Supabase 대시보드 → Storage
2. "New bucket" 클릭
3. Name: `blog-images`
4. Public bucket 체크
5. "Create bucket" 클릭
6. Policies → "New Policy" → "Allow public read access" 선택

### 6. 관리자 계정 생성

1. Supabase 대시보드 → Authentication → Users
2. "Add user" 클릭
3. 이메일/비밀번호 입력
4. "Auto Confirm User" 체크
5. "Create user" 클릭

## 🎯 실행

### 개발 모드

\`\`\`bash
npm run dev
\`\`\`

http://localhost:3000 접속

### 프로덕션 빌드

\`\`\`bash
npm run build
npm run start
\`\`\`

## 📁 프로젝트 구조

\`\`\`
newsletter-blog/
├── app/
│   ├── (public)/           # 퍼블릭 라우트
│   │   ├── page.tsx        # 메인 페이지
│   │   ├── post/[slug]/    # 포스트 상세
│   │   └── layout.tsx
│   ├── admin/              # 관리자 라우트
│   │   ├── page.tsx        # 대시보드
│   │   ├── posts/          # 포스트 관리
│   │   ├── header/         # 헤더 설정
│   │   ├── subscribers/    # 구독자 관리
│   │   └── layout.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Header.tsx          # 헤더
│   ├── HeroSection.tsx     # Hero 섹션
│   ├── PostCard.tsx        # 포스트 카드
│   └── NewsletterForm.tsx  # 구독 폼
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   └── types.ts            # TypeScript 타입
└── supabase_setup.sql      # DB 설정 SQL
\`\`\`

## 📝 사용 방법

### 1. 헤더 설정

1. `/admin/header` 접속
2. 제목, 설명, 이미지 설정
3. 저장

### 2. 포스트 작성

1. `/admin/posts/new` 접속
2. 제목, 설명, 카테고리, 본문 작성
3. 썸네일 이미지 업로드
4. "즉시 게시" 체크 (선택)
5. 저장

### 3. 포스트 수정/삭제

1. `/admin/posts` 접속
2. 수정할 포스트 클릭
3. 내용 수정 또는 삭제 버튼 클릭

### 4. 구독자 관리

1. `/admin/subscribers` 접속
2. 구독자 목록 확인
3. CSV 내보내기 (선택)

## 🌐 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. https://vercel.com 접속
3. "Import Project" 클릭
4. GitHub 레포지토리 선택
5. 환경변수 3개 추가
6. "Deploy" 클릭

### 배포 후 설정

1. Supabase → Authentication → URL Configuration
2. Site URL에 Vercel URL 추가
3. Redirect URLs에 `/admin` 경로 추가

## 🔗 LoveAfrica 메인 사이트 연동

메인 사이트에서 뉴스레터 포스트를 표시하려면:

1. 동일한 Supabase 환경변수 사용
2. 메인 사이트에 `NewsletterSection` 컴포넌트 추가
3. Supabase에서 최신 포스트 6개 쿼리
4. 카드 클릭 시 뉴스레터 블로그로 링크

자세한 내용은 프로젝트 문서 참고

## 📊 데이터베이스 스키마

### posts
- id, title, description, content
- thumbnail_url, category, read_time
- slug, published
- created_at, updated_at

### subscribers
- id, email, active, subscribed_at

### header_config
- id, main_title, main_description
- main_image_url, updated_at

## 🎨 커스터마이징

### 스타일 변경
- `app/globals.css` - 전역 스타일
- `tailwind.config.ts` - Tailwind 설정

### 컴포넌트 수정
- `components/` 폴더의 각 컴포넌트 수정

## 🐛 문제 해결

### 환경변수 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 모든 환경변수가 올바르게 설정되었는지 확인
- 개발 서버 재시작

### 이미지 업로드 실패
- Supabase Storage 버킷이 생성되었는지 확인
- Public access 정책이 설정되었는지 확인
- next.config.js의 이미지 도메인 설정 확인

### 데이터베이스 연결 오류
- Supabase 프로젝트가 활성화되었는지 확인
- API 키가 올바른지 확인
- RLS 정책이 올바르게 설정되었는지 확인

## 📄 라이선스

MIT License

## 👤 작성자

러브아프리카 개발팀

## 🙏 감사

- Next.js 팀
- Supabase 팀
- Tailwind CSS 팀

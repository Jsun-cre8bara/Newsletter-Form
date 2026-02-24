# 환경변수 설정 가이드

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 붙여넣으세요.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ozeslhrhnrxmepdphzxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_키_붙여넣기
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_키_붙여넣기
```

## 값을 찾는 방법

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `loveafrica-newsletter`
3. Settings → API 클릭
4. "Legacy anon, service_role API keys" 탭 클릭
5. 아래 값들을 복사:
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 붙여넣기
   - **service_role**: `SUPABASE_SERVICE_ROLE_KEY`에 붙여넣기

## 주의사항

- `.env.local` 파일은 절대 GitHub에 올리지 마세요 (이미 .gitignore에 포함됨)
- 키는 `eyJ`로 시작하는 매우 긴 문자열입니다
- 모든 값을 입력해야 프로젝트가 정상 작동합니다

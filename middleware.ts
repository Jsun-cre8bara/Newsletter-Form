import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // /admin 경로에 접근하는 경우 (로그인 페이지 제외)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      request.nextUrl.pathname !== '/admin/login') {
    
    // 세션 쿠키 확인
    const session = request.cookies.get('admin_session')
    
    // 세션이 없으면 로그인 페이지로 리다이렉트
    if (!session || session.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 로그인된 상태에서 로그인 페이지 접근 시 대시보드로 리다이렉트
  if (request.nextUrl.pathname === '/admin/login') {
    const session = request.cookies.get('admin_session')
    
    if (session && session.value === 'authenticated') {
      const adminUrl = new URL('/admin', request.url)
      return NextResponse.redirect(adminUrl)
    }
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: '/admin/:path*',
}

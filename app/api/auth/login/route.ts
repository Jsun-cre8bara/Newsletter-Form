import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🔐 [LOGIN] 로그인 요청 시작')
  
  try {
    const { password } = await request.json()
    console.log('📥 [LOGIN] 비밀번호 수신:', password ? '있음' : '없음')

    // 환경변수에서 관리자 비밀번호 가져오기
    const adminPassword = process.env.ADMIN_PASSWORD?.trim()
    console.log('🔑 [LOGIN] 환경변수 ADMIN_PASSWORD:', adminPassword ? '설정됨' : '❌ 없음')

    if (!adminPassword) {
      console.error('❌ [LOGIN] 환경변수가 설정되지 않음')
      return NextResponse.json(
        { error: '서버 설정 오류: 관리자 비밀번호가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // 비밀번호 확인 (양쪽 모두 trim 처리)
    const trimmedPassword = password?.trim()
    console.log('🔍 [LOGIN] 비밀번호 비교 중...')
    console.log('  - 입력된 비밀번호:', `"${trimmedPassword}"`)
    console.log('  - 설정된 비밀번호:', `"${adminPassword}"`)
    
    if (trimmedPassword !== adminPassword) {
      console.log('❌ [LOGIN] 비밀번호 불일치')
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    console.log('✅ [LOGIN] 비밀번호 일치!')
    
    // 세션 쿠키 생성 (7일 유효)
    console.log('🍪 [LOGIN] 쿠키 생성 시작...')
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })
    console.log('✅ [LOGIN] 쿠키 생성 완료')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌❌❌ [LOGIN] 에러 발생:', error)
    console.error('에러 상세:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

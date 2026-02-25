import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) return null

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = request.cookies.get('admin_session')
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const adminSupabase = getAdminClient()
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // 구독자 삭제
    const { error } = await adminSupabase
      .from('subscribers')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('❌ [API] 구독자 삭제 실패:', error)
      return NextResponse.json(
        { error: error.message || '구독자 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    console.log('✅ [API] 구독자 삭제 성공:', params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [API] 구독자 삭제 예외:', error)
    return NextResponse.json(
      { error: '구독자 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

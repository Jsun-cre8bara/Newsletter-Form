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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: '이메일이 필요합니다' },
        { status: 400 }
      )
    }

    const adminSupabase = getAdminClient()
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // 구독자 조회
    const { data: subscriber, error: findError } = await adminSupabase
      .from('subscribers')
      .select('id, email, active')
      .eq('email', email)
      .single()

    if (findError || !subscriber) {
      return NextResponse.json(
        { error: '구독자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (!subscriber.active) {
      return NextResponse.json(
        { error: '이미 구독이 취소된 이메일입니다' },
        { status: 400 }
      )
    }

    // 구독 취소 (active를 false로 변경)
    const { error: updateError } = await adminSupabase
      .from('subscribers')
      .update({ active: false })
      .eq('id', subscriber.id)

    if (updateError) {
      console.error('❌ [API] 구독 취소 실패:', updateError)
      return NextResponse.json(
        { error: '구독 취소에 실패했습니다' },
        { status: 500 }
      )
    }

    console.log('✅ [API] 구독 취소 성공:', email)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [API] 구독 취소 예외:', error)
    return NextResponse.json(
      { error: '구독 취소 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

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

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일이 필요합니다' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다' },
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

    const { data: existingSubscriber, error: findError } = await adminSupabase
      .from('subscribers')
      .select('id, active')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (findError) {
      return NextResponse.json(
        { error: findError.message || '구독자 조회에 실패했습니다' },
        { status: 500 }
      )
    }

    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return NextResponse.json(
          { error: '이미 구독 중인 이메일입니다.' },
          { status: 409 }
        )
      }

      const { error: reactivateError } = await adminSupabase
        .from('subscribers')
        .update({
          active: true,
          subscribed_at: new Date().toISOString(),
        })
        .eq('id', existingSubscriber.id)

      if (reactivateError) {
        return NextResponse.json(
          { error: reactivateError.message || '구독 재활성화에 실패했습니다' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, reactivated: true })
    }

    const { error: insertError } = await adminSupabase
      .from('subscribers')
      .insert([{ email: normalizedEmail, active: true }])

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || '구독 신청에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, reactivated: false })
  } catch (error) {
    console.error('❌ [API] 구독 처리 예외:', error)
    return NextResponse.json(
      { error: '구독 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

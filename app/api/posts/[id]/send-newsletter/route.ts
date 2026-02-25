import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

function getSiteOrigin(request: NextRequest) {
  const configured =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  if (configured) return configured.replace(/\/$/, '')
  return request.nextUrl.origin
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const resend = new Resend(resendApiKey)

    const { data: post, error: postError } = await adminSupabase
      .from('posts')
      .select('id, title, description, slug, published')
      .eq('id', params.id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: postError?.message || '포스트를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (!post.published) {
      return NextResponse.json(
        { error: '게시된 포스트만 구독자에게 발송할 수 있습니다' },
        { status: 400 }
      )
    }

    const { data: subscribers, error: subError } = await adminSupabase
      .from('subscribers')
      .select('email')
      .eq('active', true)

    if (subError) {
      return NextResponse.json(
        { error: subError.message || '구독자 조회에 실패했습니다' },
        { status: 500 }
      )
    }

    const emails = (subscribers || []).map((s) => s.email).filter(Boolean)
    if (emails.length === 0) {
      return NextResponse.json(
        { error: '활성 구독자가 없습니다' },
        { status: 400 }
      )
    }

    const origin = getSiteOrigin(request)
    const postUrl = `${origin}/post/${post.slug}`
    const fromAddress = process.env.NEWSLETTER_FROM_EMAIL || 'onboarding@resend.dev'
    const subject = `[러브아프리카 뉴스레터] ${post.title}`

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 12px;">${post.title}</h2>
        <p style="margin: 0 0 16px; color: #4b5563;">${post.description || ''}</p>
        <p style="margin: 0 0 20px;">새 뉴스레터가 발행되었습니다. 아래 버튼을 눌러 확인해 주세요.</p>
        <a href="${postUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;">
          포스트 보러가기
        </a>
        <p style="margin-top:20px;font-size:12px;color:#6b7280;">
          버튼이 동작하지 않으면 아래 링크를 복사해 접속하세요.<br/>
          <a href="${postUrl}">${postUrl}</a>
        </p>
      </div>
    `

    const sendResults = await Promise.allSettled(
      emails.map((email) =>
        resend.emails.send({
          from: fromAddress,
          to: email,
          subject,
          html,
        })
      )
    )

    const successCount = sendResults.filter((r) => r.status === 'fulfilled').length
    const failed = sendResults.length - successCount

    return NextResponse.json({
      success: true,
      postId: post.id,
      total: emails.length,
      sent: successCount,
      failed,
      postUrl,
    })
  } catch (error) {
    console.error('❌ [API] 뉴스레터 발송 예외:', error)
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}


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
      console.error('❌ [API] RESEND_API_KEY 환경변수가 설정되지 않았습니다')
      return NextResponse.json(
        { error: 'RESEND_API_KEY 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // API 키 확인 (보안을 위해 일부만 로깅)
    console.log('🔑 [API] Resend API 키 확인:', resendApiKey ? `${resendApiKey.substring(0, 10)}...` : '없음')

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
    const subject = `[러브아프리카 뉴스레터] ${post.title}`

    console.log('📧 [API] 이메일 발송 시작:', {
      구독자수: emails.length,
      from: 'news@loveafrica.or.kr',
      reply_to: 'loveafrica1004@gmail.com',
      subject,
      postUrl,
    })

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

    // 이메일 발송
    console.log('📤 [API] Resend API 호출 시작...')
    const sendResults = await Promise.allSettled(
      emails.map(async (email) => {
        try {
          console.log(`📨 [API] 이메일 발송 시도: ${email}`)
          const result = await resend.emails.send({
            from: 'news@loveafrica.or.kr',
            to: email,
            replyTo: 'loveafrica1004@gmail.com',
            subject,
            html,
          })
          console.log(`✅ [API] Resend 응답 (${email}):`, result)
          return result
        } catch (error: any) {
          console.error(`❌ [API] Resend API 호출 실패 (${email}):`, {
            message: error?.message,
            status: error?.status,
            name: error?.name,
            stack: error?.stack,
            fullError: error,
          })
          throw error
        }
      })
    )

    // 발송 결과 상세 로깅
    const failedResults: Array<{ email: string; error: any }> = []
    sendResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        const email = emails[index]
        console.error(`❌ [API] 이메일 발송 실패 (${email}):`, result.reason)
        failedResults.push({ email, error: result.reason })
      } else if (result.status === 'fulfilled') {
        const email = emails[index]
        console.log(`✅ [API] 이메일 발송 성공 (${email}):`, result.value)
      }
    })

    const successCount = sendResults.filter((r) => r.status === 'fulfilled').length
    const failed = sendResults.length - successCount

    // 실패한 경우 상세 에러 로그
    if (failed > 0) {
      console.error(`❌ [API] 총 ${failed}개 이메일 발송 실패:`, failedResults)
    }

    // 발송 이력 저장 (테이블이 없는 초기 상태에서도 발송 자체는 성공 처리)
    const { error: logError } = await adminSupabase
      .from('newsletter_send_logs')
      .insert([
        {
          post_id: post.id,
          post_title: post.title,
          post_url: postUrl,
          total_count: emails.length,
          sent_count: successCount,
          failed_count: failed,
          sent_at: new Date().toISOString(),
        },
      ])

    if (logError) {
      console.warn('⚠️ [API] 발송 이력 저장 실패:', logError.message)
    }

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


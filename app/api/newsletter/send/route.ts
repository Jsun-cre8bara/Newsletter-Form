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

// 마크다운을 HTML로 변환하는 간단한 함수
function markdownToHtml(markdown: string): string {
  let html = markdown
  
  // 헤더 변환
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin: 16px 0 8px; font-size: 18px; font-weight: bold;">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin: 20px 0 12px; font-size: 20px; font-weight: bold;">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin: 24px 0 16px; font-size: 24px; font-weight: bold;">$1</h1>')
  
  // 볼드
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
  
  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" style="color: #2563eb; text-decoration: underline;">$1</a>')
  
  // 줄바꿈
  html = html.replace(/\n\n/gim, '</p><p style="margin: 12px 0;">')
  html = html.replace(/\n/gim, '<br>')
  
  // 문단 감싸기
  if (!html.startsWith('<')) {
    html = '<p style="margin: 12px 0;">' + html + '</p>'
  }
  
  return html
}

export async function POST(request: NextRequest) {
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

    const { subject, content, linkUrl, linkText } = await request.json()

    if (!subject || !content) {
      return NextResponse.json(
        { error: '제목과 본문은 필수입니다' },
        { status: 400 }
      )
    }

    // 활성 구독자 조회
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

    const resend = new Resend(resendApiKey)
    
    console.log('📧 [API] 이메일 발송 시작:', {
      구독자수: emails.length,
      from: 'news@loveafrica.or.kr',
      reply_to: 'loveafrica1004@gmail.com',
      subject,
    })
    
    // 본문을 HTML로 변환
    const contentHtml = markdownToHtml(content)
    
    // 링크 버튼 HTML 생성
    const linkButtonHtml = linkUrl
      ? `
        <div style="margin: 24px 0;">
          <a href="${linkUrl}" style="display:inline-block;padding:12px 24px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-weight:500;">
            ${linkText || '포스트 보러가기'}
          </a>
        </div>
      `
      : ''

    // 전체 HTML 이메일 템플릿
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto;">
        <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
          ${contentHtml}
          ${linkButtonHtml}
          ${linkUrl ? `
            <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
              버튼이 동작하지 않으면 아래 링크를 복사해 접속하세요.<br/>
              <a href="${linkUrl}" style="color: #2563eb; word-break: break-all;">${linkUrl}</a>
            </p>
          ` : ''}
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center;">
          이 뉴스레터는 러브아프리카에서 발송되었습니다.
        </p>
      </div>
    `

    // 이메일 발송
    console.log('📤 [API] Resend API 호출 시작...')
    console.log('📋 [API] 발송 대상:', emails)
    
    const sendResults = await Promise.allSettled(
      emails.map(async (email) => {
        try {
          console.log(`📨 [API] 이메일 발송 시도: ${email}`)
          const result = await resend.emails.send({
            from: 'news@loveafrica.or.kr',
            to: email,
            reply_to: 'loveafrica1004@gmail.com',
            subject,
            html,
          })
          console.log(`✅ [API] Resend 응답 (${email}):`, JSON.stringify(result, null, 2))
          return result
        } catch (error: any) {
          const errorDetails = {
            message: error?.message,
            status: error?.status,
            statusCode: error?.statusCode,
            name: error?.name,
            code: error?.code,
            response: error?.response ? JSON.stringify(error.response) : undefined,
            fullError: String(error),
          }
          console.error(`❌ [API] Resend API 호출 실패 (${email}):`, JSON.stringify(errorDetails, null, 2))
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
      console.error(`❌ [API] 총 ${failed}개 이메일 발송 실패:`, JSON.stringify(failedResults, null, 2))
      
      // 모든 이메일이 실패한 경우 에러 반환
      if (failed === emails.length) {
        const firstError = failedResults[0]?.error
        return NextResponse.json(
          { 
            error: '모든 이메일 발송에 실패했습니다',
            details: failedResults,
            firstError: firstError ? {
              message: firstError?.message,
              status: firstError?.status,
              statusCode: firstError?.statusCode,
            } : undefined,
          },
          { status: 500 }
        )
      }
    }

    // 발송 이력 저장
    const origin = getSiteOrigin(request)
    const { error: logError } = await adminSupabase
      .from('newsletter_send_logs')
      .insert([
        {
          post_id: null, // 커스텀 뉴스레터는 post_id가 없음
          post_title: subject,
          post_url: linkUrl || origin,
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
      total: emails.length,
      sent: successCount,
      failed,
      failedDetails: failed > 0 ? failedResults : undefined,
    })
  } catch (error) {
    console.error('❌ [API] 뉴스레터 발송 예외:', error)
    return NextResponse.json(
      { error: '뉴스레터 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TEST] Resend API 테스트 시작')
    
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY가 설정되지 않았습니다',
        keyLength: 0,
        keyExists: false,
      }, { status: 500 })
    }

    const expectedKey = 're_DVCAb6RN_9KuT6Q6PyFyu6txoPxvC5nQE'
    console.log('🔑 [TEST] API KEY 확인:', {
      exists: !!resendApiKey,
      length: resendApiKey.length,
      expectedLength: expectedKey.length,
      prefix: resendApiKey.substring(0, 15),
      expectedPrefix: expectedKey.substring(0, 15),
      matches: resendApiKey === expectedKey,
      fullKey: resendApiKey, // 디버깅용 전체 키 출력
    })

    console.log('📦 [TEST] Resend 인스턴스 생성 시작...')
    const resend = new Resend(resendApiKey)
    console.log('📦 [TEST] Resend 인스턴스 생성 완료:', resend ? '성공' : '실패')
    console.log('📦 [TEST] resend.emails 존재:', !!resend?.emails)

    // 테스트 이메일 발송
    console.log('📨 [TEST] 테스트 이메일 발송 시작...')
    const testEmail = 'loveafrica1004@gmail.com'
    
    const result = await resend.emails.send({
      from: 'news@loveafrica.or.kr',
      to: testEmail,
      replyTo: 'loveafrica1004@gmail.com',
      subject: '[테스트] Resend API 호출 확인',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Resend API 테스트 성공!</h2>
          <p>이 이메일이 도착했다면 Resend API 호출이 정상적으로 작동하는 것입니다.</p>
          <p>발송 시간: ${new Date().toLocaleString('ko-KR')}</p>
        </div>
      `,
    })

    console.log('✅ [TEST] Resend API 호출 성공:', result)

    return NextResponse.json({
      success: true,
      message: 'Resend API 호출 성공',
      result: {
        id: result.data?.id,
        data: result.data,
      },
      apiKeyInfo: {
        exists: true,
        length: resendApiKey.length,
        expectedLength: 51,
        prefix: resendApiKey.substring(0, 15),
        expectedPrefix: 're_DVCAb6RN_9KuT',
        matchesExpected: resendApiKey === 're_DVCAb6RN_9KuT6Q6PyFyu6txoPxvC5nQE',
        fullKey: resendApiKey, // 디버깅용 - 실제 로드된 전체 키
        hasWhitespace: resendApiKey.trim() !== resendApiKey,
        trimmedLength: resendApiKey.trim().length,
      },
      resendInstance: {
        created: !!resend,
        hasEmails: !!resend?.emails,
      },
    })
  } catch (error: any) {
    console.error('❌ [TEST] Resend API 호출 실패:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Resend API 호출 실패',
      details: {
        message: error?.message,
        status: error?.status,
        statusCode: error?.statusCode,
        name: error?.name,
        code: error?.code,
        response: error?.response,
        stack: error?.stack,
      },
      apiKeyInfo: {
        exists: !!process.env.RESEND_API_KEY,
        length: process.env.RESEND_API_KEY?.length || 0,
        expectedLength: 51,
        prefix: process.env.RESEND_API_KEY?.substring(0, 15) || '없음',
        fullKey: process.env.RESEND_API_KEY || '없음', // 디버깅용
        hasWhitespace: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() !== process.env.RESEND_API_KEY : false,
        trimmedLength: process.env.RESEND_API_KEY?.trim().length || 0,
      },
    }, { status: 500 })
  }
}

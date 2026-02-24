import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // 서버 사이드에서만 Service Role Key 사용
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      )
    }

    console.log('📤 [API] 이미지 업로드 시작:', file.name, file.size, 'bytes')

    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomStr}.${fileExt}`

    const { data: uploadData, error } = await adminSupabase.storage
      .from('blog-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ [API] 업로드 실패:', error)
      return NextResponse.json(
        { error: error.message || '이미지 업로드에 실패했습니다' },
        { status: 500 }
      )
    }

    console.log('✅ [API] 업로드 성공:', uploadData)

    const { data: urlData } = adminSupabase.storage
      .from('blog-images')
      .getPublicUrl(fileName)

    console.log('🔗 [API] Public URL 생성:', urlData.publicUrl)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (error) {
    console.error('❌ [API] 업로드 예외:', error)
    return NextResponse.json(
      { error: '이미지 업로드 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const { title, description, content, thumbnail_url, category, read_time, slug, published } = body

    console.log('📝 [API] 포스트 생성 시작:', { title, slug })

    // Insert post
    const { data, error } = await adminSupabase
      .from('posts')
      .insert([{
        title,
        description,
        content,
        thumbnail_url,
        category,
        read_time,
        slug,
        published,
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ [API] 포스트 생성 실패:', error)
      return NextResponse.json(
        { error: error.message || '포스트 생성에 실패했습니다' },
        { status: 500 }
      )
    }

    console.log('✅ [API] 포스트 생성 성공:', data.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('❌ [API] 포스트 생성 예외:', error)
    return NextResponse.json(
      { error: '포스트 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

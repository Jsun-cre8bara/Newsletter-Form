import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getAdminClient()
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const { data, error } = await adminSupabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || '포스트를 불러오지 못했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('❌ [API] 포스트 조회 예외:', error)
    return NextResponse.json(
      { error: '포스트 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getAdminClient()
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      content,
      thumbnail_url,
      category,
      read_time,
      slug,
      published,
    } = body

    const { data, error } = await adminSupabase
      .from('posts')
      .update({
        title,
        description,
        content,
        thumbnail_url,
        category,
        read_time,
        slug,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || '포스트 수정에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('❌ [API] 포스트 수정 예외:', error)
    return NextResponse.json(
      { error: '포스트 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getAdminClient()
    if (!adminSupabase) {
      return NextResponse.json(
        { error: 'Supabase 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const { error } = await adminSupabase
      .from('posts')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: error.message || '포스트 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [API] 포스트 삭제 예외:', error)
    return NextResponse.json(
      { error: '포스트 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}


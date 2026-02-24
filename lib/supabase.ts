import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!

// 환경변수 체크
console.log('🔧 Supabase 환경변수 체크:')
console.log('- URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
console.log('- Anon Key:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음')
console.log('- Service Key:', supabaseServiceKey ? '✅ 설정됨' : '❌ 없음')

// Public client (read-only for most operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role (full access, bypass RLS)
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper functions for image upload (uses admin client for full access)
export const uploadImage = async (file: File, bucket: string = 'blog-images'): Promise<string | null> => {
  try {
    console.log('📤 [uploadImage] 시작')
    console.log('  - 파일명:', file.name)
    console.log('  - 파일 크기:', file.size, 'bytes')
    console.log('  - 버킷:', bucket)
    
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const fileName = `${timestamp}-${randomStr}.${fileExt}`
    const filePath = fileName

    console.log('  - 생성된 파일명:', fileName)

    const { data: uploadData, error } = await adminSupabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ [uploadImage] 업로드 실패:', error)
      console.error('  - 에러 메시지:', error.message)
      console.error('  - 에러 상세:', error)
      return null
    }

    console.log('✅ [uploadImage] 업로드 성공:', uploadData)

    const { data: urlData } = adminSupabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('🔗 [uploadImage] Public URL 생성:', urlData.publicUrl)

    return urlData.publicUrl
  } catch (error) {
    console.error('❌ [uploadImage] 예외 발생:', error)
    return null
  }
}

// Helper function to delete image (uses admin client for full access)
export const deleteImage = async (url: string, bucket: string = 'blog-images'): Promise<boolean> => {
  try {
    const fileName = url.split('/').pop()
    if (!fileName) return false

    const { error } = await adminSupabase.storage
      .from(bucket)
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

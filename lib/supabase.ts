import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 환경변수 체크 (서버 사이드에서만)
if (typeof window === 'undefined') {
  console.log('🔧 Supabase 환경변수 체크:')
  console.log('- URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
  console.log('- Anon Key:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음')
  console.log('- Service Key:', supabaseServiceKey ? '✅ 설정됨' : '❌ 없음')
}

// Public client (read-only for most operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role (full access, bypass RLS)
// Only create on server side where SERVICE_ROLE_KEY is available
export const adminSupabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient(supabaseUrl, supabaseAnonKey) // Fallback to anon client on client side

// Helper functions for image upload (uses API route for server-side upload)
export const uploadImage = async (file: File, bucket: string = 'blog-images'): Promise<string | null> => {
  try {
    console.log('📤 [uploadImage] 시작')
    console.log('  - 파일명:', file.name)
    console.log('  - 파일 크기:', file.size, 'bytes')
    console.log('  - 버킷:', bucket)
    
    // API Route를 통해 서버 사이드에서 업로드
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ [uploadImage] 업로드 실패:', error)
      return null
    }

    const data = await response.json()
    console.log('✅ [uploadImage] 업로드 성공:', data.url)
    
    return data.url
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

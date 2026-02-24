'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { adminSupabase, uploadImage, deleteImage } from '@/lib/supabase'
import { Post, PostFormData } from '@/lib/types'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [post, setPost] = useState<Post | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingContentImage, setUploadingContentImage] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PostFormData>()
  
  const contentValue = watch('content')

  useEffect(() => {
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    const { data, error } = await adminSupabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      setError('포스트를 불러올 수 없습니다')
      return
    }

    setPost(data)
    setThumbnailPreview(data.thumbnail_url)
    reset({
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      category: data.category,
      read_time: data.read_time,
      published: data.published,
    })
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle content image upload
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingContentImage(true)
    console.log('📸 본문 이미지 업로드 시작:', file.name)

    try {
      const imageUrl = await uploadImage(file)
      
      if (imageUrl) {
        console.log('✅ 본문 이미지 업로드 성공:', imageUrl)
        
        // 마크다운 형식으로 이미지 삽입
        const imageMarkdown = `\n![${file.name.split('.')[0]}](${imageUrl})\n`
        
        // 현재 커서 위치에 삽입
        const textarea = contentTextareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const currentContent = contentValue || ''
          const newContent = 
            currentContent.substring(0, start) + 
            imageMarkdown + 
            currentContent.substring(end)
          
          setValue('content', newContent)
          
          // 커서를 삽입된 마크다운 뒤로 이동
          setTimeout(() => {
            textarea.focus()
            const newPosition = start + imageMarkdown.length
            textarea.setSelectionRange(newPosition, newPosition)
          }, 0)
          
          alert('✅ 이미지가 본문에 삽입되었습니다!')
        } else {
          // textarea ref가 없으면 끝에 추가
          setValue('content', (contentValue || '') + imageMarkdown)
          alert('✅ 이미지가 본문 끝에 추가되었습니다!')
        }
      } else {
        throw new Error('이미지 업로드에 실패했습니다')
      }
    } catch (error) {
      console.error('❌ 본문 이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setUploadingContentImage(false)
      // 파일 input 초기화
      e.target.value = ''
    }
  }

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      let thumbnailUrl = post?.thumbnail_url || ''

      // Upload new thumbnail if provided
      if (data.thumbnail && data.thumbnail[0]) {
        // Delete old image if exists
        if (thumbnailUrl) {
          await deleteImage(thumbnailUrl)
        }

        const uploadedUrl = await uploadImage(data.thumbnail[0])
        if (uploadedUrl) {
          thumbnailUrl = uploadedUrl
        } else {
          throw new Error('이미지 업로드에 실패했습니다')
        }
      }

      // Update slug if changed
      let slug = data.slug
      if (!slug) {
        // Check if title contains Korean characters
        const hasKorean = /[가-힣]/.test(data.title)
        if (hasKorean) {
          // Keep existing slug if it exists, otherwise use timestamp
          slug = post?.slug || `post-${Date.now()}`
        } else {
          // Use title-based slug for English titles
          slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
      }

      // Update post
      const { error: updateError } = await adminSupabase
        .from('posts')
        .update({
          title: data.title,
          description: data.description,
          content: data.content,
          thumbnail_url: thumbnailUrl,
          category: data.category,
          read_time: data.read_time,
          slug: slug,
          published: data.published,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      console.error('Error updating post:', err)
      setError(err instanceof Error ? err.message : '포스트 수정에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말로 이 포스트를 삭제하시겠습니까?')) return

    setIsDeleting(true)
    setError(null)

    try {
      // Delete thumbnail if exists
      if (post?.thumbnail_url) {
        await deleteImage(post.thumbnail_url)
      }

      // Delete post
      const { error: deleteError } = await adminSupabase
        .from('posts')
        .delete()
        .eq('id', params.id)

      if (deleteError) throw deleteError

      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      console.error('Error deleting post:', err)
      setError(err instanceof Error ? err.message : '포스트 삭제에 실패했습니다')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!post) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/posts"
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">포스트 수정</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              {...register('title', { required: '제목을 입력해주세요' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL 슬러그
            </label>
            <input
              type="text"
              {...register('slug')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 *
            </label>
            <textarea
              {...register('description', { required: '설명을 입력해주세요' })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category & Read Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <input
                type="text"
                {...register('category', { required: '카테고리를 입력해주세요' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                읽는 시간
              </label>
              <input
                type="text"
                {...register('read_time')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 이미지
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition">
                <Upload className="w-5 h-5" />
                이미지 변경
                <input
                  type="file"
                  accept="image/*"
                  {...register('thumbnail')}
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                본문 (Markdown) *
              </label>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 cursor-pointer transition text-sm">
                <ImageIcon className="w-4 h-4" />
                {uploadingContentImage ? '업로드 중...' : '본문 이미지 추가'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleContentImageUpload}
                  disabled={uploadingContentImage}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              {...register('content', { required: '본문을 입력해주세요' })}
              ref={(e) => {
                const { ref } = register('content')
                if (typeof ref === 'function') {
                  ref(e)
                }
                contentTextareaRef.current = e
              }}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              💡 팁: 커서를 원하는 위치에 놓고 '본문 이미지 추가' 버튼을 클릭하면 해당 위치에 이미지가 삽입됩니다.
            </p>
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('published')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              게시
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
            
            <div className="flex gap-4">
              <Link
                href="/admin/posts"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

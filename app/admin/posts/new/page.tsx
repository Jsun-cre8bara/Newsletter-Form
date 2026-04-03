'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { uploadImage } from '@/lib/supabase'
import { PostFormData } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

export default function NewPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingContentImage, setUploadingContentImage] = useState(false)
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  
  // 이미지 경로 관리를 위한 state
  const [imagePath, setImagePath] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PostFormData>({
    defaultValues: {
      published: false,
      read_time: '5분 읽기',
    }
  })

  const thumbnailFile = watch('thumbnail')
  const contentValue = watch('content')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [contentImageUrl, setContentImageUrl] = useState('')
  const [showPreview, setShowPreview] = useState(true)

  // Handle thumbnail preview
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    setError(null)

    // 업로드 완료 전에도 바로 미리보기
    const reader = new FileReader()
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const uploadedUrl = await uploadImage(file)
      if (!uploadedUrl) throw new Error('이미지 업로드에 실패했습니다.')

      setThumbnailUrl(uploadedUrl)
      setThumbnailPreview(uploadedUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : '썸네일 업로드 중 오류가 발생했습니다.'
      setError(message)
      alert(message)
    } finally {
      setUploadingThumbnail(false)
      e.target.value = ''
    }
  }

  // Handle content image upload
  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingContentImage(true)

    try {
      const uploadedUrl = await uploadImage(file)
      if (!uploadedUrl) throw new Error('이미지 업로드에 실패했습니다.')

      // 마크다운 형식으로 이미지 삽입
      const imageMarkdown = `\n![${file.name.split('.')[0]}](${uploadedUrl})\n`

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
      } else {
        setValue('content', (contentValue || '') + imageMarkdown)
      }
    } catch (error) {
      console.error('❌ 이미지 경로 생성 실패:', error)
      const message = error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.'
      alert(message)
      setError(message)
    } finally {
      setUploadingContentImage(false)
      // 파일 input 초기화
      e.target.value = ''
    }
  }

  const insertContentImageByUrl = () => {
    const url = contentImageUrl.trim()
    if (!url) {
      alert('이미지 URL을 입력해주세요.')
      return
    }

    const imageMarkdown = `\n![image](${url})\n`

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

      setTimeout(() => {
        textarea.focus()
        const newPosition = start + imageMarkdown.length
        textarea.setSelectionRange(newPosition, newPosition)
      }, 0)
    } else {
      setValue('content', (contentValue || '') + imageMarkdown)
    }

    setContentImageUrl('')
  }

  const onSubmit = async (data: PostFormData) => {
    console.log('🚀 폼 제출 시작')
    console.log('📋 폼 데이터:', {
      title: data.title,
      category: data.category,
      thumbnailUrl: thumbnailUrl || '없음'
    })
    
    setIsSubmitting(true)
    setError(null)

    try {
      // 썸네일 URL 확인 (이미 생성된 GitHub URL 사용)
      if (!thumbnailUrl) {
        console.log('⚠️ 썸네일 이미지가 선택되지 않음')
      } else {
        console.log('✅ 썸네일 URL:', thumbnailUrl)
      }

      // Create slug from title
      let slug = data.slug
      if (!slug) {
        // Check if title contains Korean characters
        const hasKorean = /[가-힣]/.test(data.title)
        if (hasKorean) {
          // Use timestamp-based slug for Korean titles
          slug = `post-${Date.now()}`
        } else {
          // Use title-based slug for English titles
          slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
      }

      // Insert post via API route
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          content: data.content,
          thumbnail_url: thumbnailUrl,
          category: data.category,
          read_time: '5분 읽기',
          slug: slug,
          published: data.published,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '포스트 생성에 실패했습니다')
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      console.error('Error creating post:', err)
      setError(err instanceof Error ? err.message : '포스트 생성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900">새 포스트 작성</h1>
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
              placeholder="포스트 제목"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL 슬러그 (선택사항)
            </label>
            <input
              type="text"
              {...register('slug')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="post-url-slug (비워두면 자동 생성)"
            />
            <p className="mt-1 text-sm text-gray-500">
              비워두면 제목에서 자동으로 생성됩니다
            </p>
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
              placeholder="포스트 요약 설명"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <input
              type="text"
              {...register('category', { required: '카테고리를 입력해주세요' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="개발, 디자인, UX 등"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 이미지
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition">
                <Upload className="w-5 h-5" />
                이미지 업로드
                <input
                  type="file"
                  accept="image/*"
                  {...register('thumbnail', {
                    onChange: (e) => handleThumbnailChange(e)
                  })}
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

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                또는 썸네일 URL 직접 입력
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => {
                  setThumbnailUrl(e.target.value)
                  setThumbnailPreview(e.target.value || null)
                }}
                placeholder="https://... (예: Supabase public URL)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploadingThumbnail}
              />
            </div>
          </div>

          {/* Image Path Settings */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              📁 이미지 저장 경로 설정
            </label>
            <div className="mb-3">
              <input
                type="text"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="예: kim/0225/01 또는 hwang/0312/mission"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-600">
              💾 저장 경로: <code className="bg-white px-2 py-1 rounded">img_upload/{imagePath || '경로'}/파일명.jpg</code>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              💡 팁: 슬래시(/)로 하위 폴더를 구분하세요. img_upload/ 는 자동으로 추가됩니다.
            </p>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                본문 (Markdown) *
              </label>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = contentTextareaRef.current
                      if (!textarea) return
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const current = contentValue || ''
                      const selected = current.substring(start, end)
                      const wrapped = `**${selected || '굵게**'}`
                      const next = current.substring(0, start) + wrapped + current.substring(end)
                      setValue('content', next)
                      setTimeout(() => {
                        textarea.focus()
                        const caret = start + wrapped.length
                        textarea.setSelectionRange(caret, caret)
                      }, 0)
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    title="굵게 (**텍스트**)"
                  >
                    굵게
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = contentTextareaRef.current
                      if (!textarea) return
                      const start = textarea.selectionStart
                      const end = textarea.selectionEnd
                      const current = contentValue || ''
                      const selected = current.substring(start, end)
                      const wrapped = `*${selected || '기울임*'}`
                      const next = current.substring(0, start) + wrapped + current.substring(end)
                      setValue('content', next)
                      setTimeout(() => {
                        textarea.focus()
                        const caret = start + wrapped.length
                        textarea.setSelectionRange(caret, caret)
                      }, 0)
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    title="기울임 (*텍스트*)"
                  >
                    기울임
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = contentTextareaRef.current
                      if (!textarea) return
                      const start = textarea.selectionStart
                      const current = contentValue || ''
                      const insert = `\n- 항목\n- 항목\n`
                      const next = current.substring(0, start) + insert + current.substring(start)
                      setValue('content', next)
                      setTimeout(() => {
                        textarea.focus()
                        const caret = start + insert.length
                        textarea.setSelectionRange(caret, caret)
                      }, 0)
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    title="목록 (- 항목)"
                  >
                    목록
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = contentTextareaRef.current
                      if (!textarea) return
                      const start = textarea.selectionStart
                      const current = contentValue || ''
                      const insert = `\n\n`
                      const next = current.substring(0, start) + insert + current.substring(start)
                      setValue('content', next)
                      setTimeout(() => {
                        textarea.focus()
                        const caret = start + insert.length
                        textarea.setSelectionRange(caret, caret)
                      }, 0)
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                    title="2줄 줄바꿈 (빈 줄 추가)"
                  >
                    줄바꿈(2줄)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
                </button>
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
            </div>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="url"
                value={contentImageUrl}
                onChange={(e) => setContentImageUrl(e.target.value)}
                placeholder="이미지 URL 붙여넣기 후 추가"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploadingContentImage}
              />
              <button
                type="button"
                onClick={insertContentImageByUrl}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={uploadingContentImage}
              >
                URL로 추가
              </button>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <textarea
                {...register('content', { required: '본문을 입력해주세요' })}
                ref={(e) => {
                  const { ref } = register('content')
                  if (typeof ref === 'function') {
                    ref(e)
                  }
                  contentTextareaRef.current = e
                }}
                rows={18}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="# 제목&#10;&#10;본문 내용을 마크다운으로 작성하세요...&#10;&#10;이미지를 삽입하려면 위의 '본문 이미지 추가' 버튼을 클릭하세요."
              />
              {showPreview && (
                <div className="flex-1 bg-white border rounded-lg p-4 overflow-auto max-h-[520px]">
                  <div className="text-sm text-gray-500 mb-2">미리보기</div>
                  <div className="prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {contentValue || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
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
              즉시 게시
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
            <Link
              href="/admin/posts"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              취소
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

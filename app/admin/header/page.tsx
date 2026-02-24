'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Save, Upload } from 'lucide-react'
import { adminSupabase, uploadImage, deleteImage } from '@/lib/supabase'
import { HeaderConfig, HeaderFormData } from '@/lib/types'

export default function HeaderSettingsPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [config, setConfig] = useState<HeaderConfig | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HeaderFormData>()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    const { data, error } = await adminSupabase
      .from('header_config')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching config:', error)
      return
    }

    if (data) {
      setConfig(data)
      setImagePreview(data.main_image_url)
      reset({
        main_title: data.main_title,
        main_description: data.main_description,
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: HeaderFormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      let imageUrl = config?.main_image_url || ''

      // Upload new image if provided
      if (data.main_image && data.main_image[0]) {
        // Delete old image if exists
        if (imageUrl) {
          await deleteImage(imageUrl)
        }

        const uploadedUrl = await uploadImage(data.main_image[0])
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          throw new Error('이미지 업로드에 실패했습니다')
        }
      }

      // Update or insert config
      if (config) {
        const { error: updateError } = await adminSupabase
          .from('header_config')
          .update({
            main_title: data.main_title,
            main_description: data.main_description,
            main_image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', config.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await adminSupabase
          .from('header_config')
          .insert([{
            main_title: data.main_title,
            main_description: data.main_description,
            main_image_url: imageUrl,
          }])

        if (insertError) throw insertError
      }

      setSuccess(true)
      fetchConfig()
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving config:', err)
      setError(err instanceof Error ? err.message : '설정 저장에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">헤더 설정</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
          헤더 설정이 저장되었습니다! 🎉
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Main Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메인 제목 *
            </label>
            <input
              type="text"
              {...register('main_title', { required: '메인 제목을 입력해주세요' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="최신 웹 개발 트렌드 2026"
            />
            {errors.main_title && (
              <p className="mt-1 text-sm text-red-600">{errors.main_title.message}</p>
            )}
          </div>

          {/* Main Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메인 설명 *
            </label>
            <textarea
              {...register('main_description', { required: '메인 설명을 입력해주세요' })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="웹 개발에 관한 최신 트렌드와 기술 스택에 대해 알아봅니다."
            />
            {errors.main_description && (
              <p className="mt-1 text-sm text-red-600">{errors.main_description.message}</p>
            )}
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메인 이미지
            </label>
            <div className="space-y-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition w-fit">
                <Upload className="w-5 h-5" />
                이미지 업로드
                <input
                  type="file"
                  accept="image/*"
                  {...register('main_image')}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Header preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              권장 크기: 1200 x 600px
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
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
      </form>

      {/* Preview */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">미리보기</h2>
        <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold text-white mb-4">
              {config?.main_title || '메인 제목'}
            </h1>
            <p className="text-lg text-gray-200">
              {config?.main_description || '메인 설명'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

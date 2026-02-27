'use client'

import { Suspense, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface UnsubscribeFormData {
  email: string
}

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UnsubscribeFormData>()

  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setValue('email', emailFromUrl)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: UnsubscribeFormData) => {
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        setResult({ 
          type: 'error', 
          message: responseData.error || '구독 취소에 실패했습니다' 
        })
      } else {
        setResult({ 
          type: 'success', 
          message: '구독이 성공적으로 취소되었습니다' 
        })
      }
    } catch (error) {
      setResult({ 
        type: 'error', 
        message: '오류가 발생했습니다. 다시 시도해주세요.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          뉴스레터 구독 취소
        </h1>
        <p className="text-gray-600 text-center mb-8">
          더 이상 뉴스레터를 받지 않으시려면 이메일을 입력해주세요
        </p>

        {!result ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email', { 
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '올바른 이메일 형식이 아닙니다'
                  }
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리 중...' : '구독 취소하기'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {result.type === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">{result.message}</p>
                  <p className="text-green-700 text-sm mt-1">
                    앞으로 뉴스레터를 받지 않으시게 됩니다.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">{result.message}</p>
                </div>
              </div>
            )}

            <Link
              href="/"
              className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              홈으로 돌아가기
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <UnsubscribeContent />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SubscriberFormData } from '@/lib/types'

export default function NewsletterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubscriberFormData>()

  const onSubmit = async (data: SubscriberFormData) => {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: data.email, active: true }])

      if (error) {
        if (error.code === '23505') { // Unique violation
          setMessage({ type: 'error', text: '이미 구독 중인 이메일입니다.' })
        } else {
          setMessage({ type: 'error', text: '구독 신청에 실패했습니다. 다시 시도해주세요.' })
        }
      } else {
        setMessage({ type: 'success', text: '구독해 주셔서 감사합니다! 🎉' })
        reset()
      }
    } catch (error) {
      setMessage({ type: 'error', text: '오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          뉴스레터 구독
        </h2>
        <p className="text-gray-600 mb-8">
          최신 블로그 포스트와 업데이트를 이메일로 받아보세요
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="email"
            placeholder="이메일 주소를 입력하세요"
            {...register('email', { 
              required: '이메일을 입력해주세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식이 아닙니다'
              }
            })}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? '구독 중...' : '구독하기'}
          </button>
        </form>

        {errors.email && (
          <p className="text-red-600 text-sm mb-2">{errors.email.message}</p>
        )}

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </section>
  )
}

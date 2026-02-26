'use client'

import { useState } from 'react'
import { X, Send, Link as LinkIcon } from 'lucide-react'

interface NewsletterComposeModalProps {
  isOpen: boolean
  onClose: () => void
  subscriberCount: number
}

export default function NewsletterComposeModal({
  isOpen,
  onClose,
  subscriberCount,
}: NewsletterComposeModalProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('포스트 보러가기')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!subject.trim()) {
      setError('제목을 입력해주세요')
      return
    }

    if (!content.trim()) {
      setError('본문을 입력해주세요')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          content,
          linkUrl: linkUrl.trim() || null,
          linkText: linkText.trim() || '포스트 보러가기',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '뉴스레터 발송에 실패했습니다')
      }

      // 발송 이력 저장 실패 경고 표시
      if (data.logError) {
        console.warn('⚠️ 발송 이력 저장 실패:', data.logError)
        setError(`이메일은 발송되었지만 이력 저장에 실패했습니다: ${data.logError.message}`)
        return
      }

      setSuccess(true)
      
      // 2초 후 모달 닫기
      setTimeout(() => {
        handleClose()
        // 페이지 새로고침하여 발송 이력 업데이트
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '뉴스레터 발송 중 오류가 발생했습니다')
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    setSubject('')
    setContent('')
    setLinkUrl('')
    setLinkText('포스트 보러가기')
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">뉴스레터 작성</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>{subscriberCount}명</strong>의 활성 구독자에게 발송됩니다.
            </p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: [러브아프리카 뉴스레터] 새로운 소식이 도착했습니다"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSending}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              본문 *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="뉴스레터 본문을 작성해주세요..."
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSending}
            />
            <p className="mt-2 text-sm text-gray-500">
              마크다운 형식으로 작성할 수 있습니다.
            </p>
          </div>

          {/* Link (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              링크 (선택사항)
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/post/slug"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSending}
              />
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="버튼 텍스트"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSending}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              링크를 입력하면 본문 하단에 버튼이 추가됩니다.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ 뉴스레터가 성공적으로 발송되었습니다!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            disabled={isSending}
          >
            취소
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !content.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {isSending ? '발송 중...' : '발송하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

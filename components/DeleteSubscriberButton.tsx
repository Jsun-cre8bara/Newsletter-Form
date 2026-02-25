'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteSubscriberButtonProps {
  subscriberId: string
  email: string
}

export default function DeleteSubscriberButton({
  subscriberId,
  email,
}: DeleteSubscriberButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`정말로 "${email}" 구독자를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/subscribers/${subscriberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '구독자 삭제에 실패했습니다')
      }

      // 성공 시 페이지 새로고침
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : '구독자 삭제 중 오류가 발생했습니다')
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      title="구독자 삭제"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  )
}

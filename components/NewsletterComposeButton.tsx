'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import NewsletterComposeModal from './NewsletterComposeModal'

interface NewsletterComposeButtonProps {
  activeSubscriberCount: number
}

export default function NewsletterComposeButton({
  activeSubscriberCount,
}: NewsletterComposeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <Send className="w-5 h-5" />
        뉴스레터 보내기
      </button>
      <NewsletterComposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriberCount={activeSubscriberCount}
      />
    </>
  )
}

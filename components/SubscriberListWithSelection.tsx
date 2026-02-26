'use client'

import { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import DeleteSubscriberButton from './DeleteSubscriberButton'
import ExportCSVButton from './ExportCSVButton'
import NewsletterComposeModal from './NewsletterComposeModal'

interface Subscriber {
  id: string
  email: string
  active: boolean
  subscribed_at: string
}

interface SubscriberListWithSelectionProps {
  subscribers: Subscriber[]
}

export default function SubscriberListWithSelection({
  subscribers,
}: SubscriberListWithSelectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const activeSubscribers = subscribers.filter(s => s.active)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(activeSubscribers.map(s => s.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const isAllSelected = activeSubscribers.length > 0 && 
    activeSubscribers.every(s => selectedIds.has(s.id))
  
  const isSomeSelected = activeSubscribers.some(s => selectedIds.has(s.id))

  const selectedEmails = subscribers
    .filter(s => selectedIds.has(s.id))
    .map(s => s.email)

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">아직 구독자가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    구독 날짜
                  </th>
                  <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(subscriber.id)}
                        onChange={(e) => handleSelectOne(subscriber.id, e.target.checked)}
                        disabled={!subscriber.active}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 break-all">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        subscriber.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscriber.active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="hidden md:inline">
                        {new Date(subscriber.subscribed_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="md:hidden">
                        {new Date(subscriber.subscribed_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                      <DeleteSubscriberButton
                        subscriberId={subscriber.id}
                        email={subscriber.email}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      {subscribers.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {selectedIds.size > 0 
              ? `선택한 ${selectedIds.size}명에게 뉴스레터 보내기` 
              : '구독자를 선택해주세요'}
          </button>
          <ExportCSVButton subscribers={subscribers} />
        </div>
      )}

      <NewsletterComposeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriberCount={selectedIds.size}
        selectedEmails={selectedEmails}
      />
    </>
  )
}

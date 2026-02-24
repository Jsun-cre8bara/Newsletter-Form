'use client'

import { Subscriber } from '@/lib/types'

interface ExportCSVButtonProps {
  subscribers: Subscriber[]
}

export default function ExportCSVButton({ subscribers }: ExportCSVButtonProps) {
  const handleExport = () => {
    const csv = 'Email,Status,Subscribed At\n' + 
      subscribers.map(s => 
        `${s.email},${s.active ? 'Active' : 'Inactive'},${s.subscribed_at}`
      ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
    >
      CSV로 내보내기
    </button>
  )
}

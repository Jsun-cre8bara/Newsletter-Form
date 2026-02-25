'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export default function LogoutButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (!confirm('로그아웃 하시겠습니까?')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      } else {
        alert('로그아웃에 실패했습니다')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('로그아웃 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline">{isLoading ? '로그아웃 중...' : '로그아웃'}</span>
    </button>
  )
}

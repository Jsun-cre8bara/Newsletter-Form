import Link from 'next/link'
import { LayoutDashboard, FileText, Image as ImageIcon, Users } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              관리자 대시보드
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                사이트 보기
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              {/* 모바일: 벌집박스 스타일 그리드 */}
              <nav className="grid grid-cols-2 gap-3 md:grid-cols-1 md:gap-2">
                <Link
                  href="/admin"
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 text-gray-700 hover:bg-gray-100 rounded-lg transition md:flex-row md:justify-start"
                >
                  <LayoutDashboard className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">대시보드</span>
                </Link>
                <Link
                  href="/admin/posts"
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 text-gray-700 hover:bg-gray-100 rounded-lg transition md:flex-row md:justify-start"
                >
                  <FileText className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">포스트 관리</span>
                </Link>
                <Link
                  href="/admin/header"
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 text-gray-700 hover:bg-gray-100 rounded-lg transition md:flex-row md:justify-start"
                >
                  <ImageIcon className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">헤더 설정</span>
                </Link>
                <Link
                  href="/admin/subscribers"
                  className="flex flex-col items-center justify-center gap-2 px-4 py-4 text-gray-700 hover:bg-gray-100 rounded-lg transition md:flex-row md:justify-start"
                >
                  <Users className="w-6 h-6 md:w-5 md:h-5" />
                  <span className="text-sm font-medium">구독자 관리</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

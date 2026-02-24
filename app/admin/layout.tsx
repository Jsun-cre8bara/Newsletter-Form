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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="text-2xl font-bold text-gray-900">
              관리자 대시보드
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
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
              <nav className="space-y-2">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>대시보드</span>
                </Link>
                <Link
                  href="/admin/posts"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <FileText className="w-5 h-5" />
                  <span>포스트 관리</span>
                </Link>
                <Link
                  href="/admin/header"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>헤더 설정</span>
                </Link>
                <Link
                  href="/admin/subscribers"
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <Users className="w-5 h-5" />
                  <span>구독자 관리</span>
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

import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-gray-700">
            <BookOpen className="w-8 h-8" />
            <span>블로그</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
              홈
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition">
              관리자
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-gray-700">
            <Image
              src="/img_upload/헤더이미지/LOA%20logo.png"
              alt="LOA 로고"
              width={52}
              height={52}
              className="rounded-md object-contain"
              priority
            />
            <span className="text-xl md:text-2xl">(사)러브아프리카 뉴스레터</span>
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

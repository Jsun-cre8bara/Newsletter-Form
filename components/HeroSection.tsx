import Image from 'next/image'
import { HeaderConfig } from '@/lib/types'

interface HeroSectionProps {
  config: HeaderConfig | null
}

export default function HeroSection({ config }: HeroSectionProps) {
  const title = config?.main_title || '최신 웹 개발 트렌드 2026'
  const description = config?.main_description || '웹 개발에 관한 최신 트렌드와 기술 스택에 대해 알아봅니다. React, TypeScript, 그리고 최신 프레임워크까지.'
  const imageUrl = config?.main_image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop'

  return (
    <section className="relative w-full h-[500px] bg-gray-900">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover opacity-60"
          priority
        />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 max-w-4xl">
          {title}
        </h1>
        <p className="text-xl text-gray-200 max-w-2xl">
          {description}
        </p>
      </div>
    </section>
  )
}

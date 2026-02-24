import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Clock, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'
import { Post } from '@/lib/types'
import NewsletterForm from '@/components/NewsletterForm'

// 이미지 파일명 매핑 (Git 파일명 → Supabase Storage 파일명)
const imageMapping: Record<string, string> = {
  '01_kim': '1770869412569-4f87fi.jpg',
  '02_kim': '1770869502060-zppflc.jpg',
  '03_kim': '1770869563419-pmpisk.jpg',
  '04_kim': '1770869558293-gxu2e8.jpg',
  '05_kim': '1770869532678-1rahev.jpg',
  '06_kim': '1770869548704-h6qqbf.jpg',
}

const SUPABASE_STORAGE_BASE_URL = 'https://ozeslhrhmrxmepdphxzy.supabase.co/storage/v1/object/public/blog-images'

// 본문에서 이미지 파일명을 마크다운 이미지 형식으로 변환
function transformImageReferences(content: string): string {
  let transformed = content
  
  // 각 이미지 파일명을 마크다운 이미지 형식으로 변환
  Object.entries(imageMapping).forEach(([fileName, storageFileName]) => {
    const imageUrl = `${SUPABASE_STORAGE_BASE_URL}/${storageFileName}`
    
    // 패턴 1: img_upload 경로가 있는 경우 변환
    transformed = transformed.replace(
      new RegExp(`img_upload[^\\s]*${fileName}[^\\s]*`, 'g'),
      imageUrl
    )
    
    // 패턴 2: 단독으로 있는 경우 (이미 마크다운 형식이 아닌 경우만)
    // ![fileName]( 형태가 이미 있으면 건너뛰기
    if (!transformed.includes(`![${fileName}](`)) {
      // 줄바꿈이나 공백 뒤에 오는 경우
      transformed = transformed.replace(
        new RegExp(`(^|\\n|\\s)${fileName}(?=\\s|\\n|$|:)`, 'g'),
        `$1![${fileName}](${imageUrl})`
      )
    }
  })
  
  return transformed
}

async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error) {
    console.error('Error fetching post:', error)
    return null
  }

  return data
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: '포스트를 찾을 수 없습니다',
    }
  }

  return {
    title: post.title,
    description: post.description,
  }
}

export const revalidate = 60

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <>
      <article className="min-h-screen">
        {/* Header Image */}
        <div className="relative w-full h-[400px] bg-gray-900">
          {post.thumbnail_url && (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover opacity-80"
              priority
            />
          )}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로 돌아가기</span>
          </Link>

          <div className="max-w-3xl mx-auto">
            {/* Category Badge */}
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{post.read_time}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              {post.description}
            </p>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{transformImageReferences(post.content)}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      <NewsletterForm />
    </>
  )
}

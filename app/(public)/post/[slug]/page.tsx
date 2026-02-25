import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Clock, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/lib/supabase'
import { Post } from '@/lib/types'
import NewsletterForm from '@/components/NewsletterForm'

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

export const revalidate = 0 // 0 = 캐시 없이 항상 최신 데이터 가져오기 (개발 중)

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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 md:text-gray-900 mb-4" style={{ color: 'var(--foreground)' }}>
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm mb-8 pb-8 border-b" style={{ color: 'var(--foreground)' }}>
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
            <p className="text-xl mb-8 leading-relaxed" style={{ color: 'var(--foreground)' }}>
              {post.description}
            </p>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...props}
                      alt={props.alt || ''}
                      className="rounded-lg shadow-md my-4 w-full h-auto"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  )
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </article>

      <NewsletterForm />
    </>
  )
}

import { supabase } from '@/lib/supabase'
import { Post, HeaderConfig } from '@/lib/types'
import HeroSection from '@/components/HeroSection'
import PostCard from '@/components/PostCard'
import NewsletterForm from '@/components/NewsletterForm'

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }

  return data || []
}

async function getHeaderConfig(): Promise<HeaderConfig | null> {
  const { data, error } = await supabase
    .from('header_config')
    .select('*')
    .single()

  if (error) {
    console.error('Error fetching header config:', error)
    return null
  }

  return data
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function HomePage() {
  const [posts, headerConfig] = await Promise.all([
    getPosts(),
    getHeaderConfig()
  ])

  return (
    <>
      <HeroSection config={headerConfig} />
      
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">최신 포스트</h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              아직 게시된 포스트가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <NewsletterForm />
    </>
  )
}

import { adminSupabase } from '@/lib/supabase'
import { FileText, Users, Eye, TrendingUp } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const [postsResult, subscribersResult, publishedResult] = await Promise.all([
    adminSupabase.from('posts').select('id', { count: 'exact', head: true }),
    adminSupabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('active', true),
    adminSupabase.from('posts').select('id', { count: 'exact', head: true }).eq('published', true),
  ])

  return {
    totalPosts: postsResult.count || 0,
    totalSubscribers: subscribersResult.count || 0,
    publishedPosts: publishedResult.count || 0,
  }
}

async function getRecentPosts() {
  const { data } = await adminSupabase
    .from('posts')
    .select('id, title, published, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return data || []
}

export const revalidate = 0 // No cache for admin

export default async function AdminDashboard() {
  const [stats, recentPosts] = await Promise.all([
    getDashboardStats(),
    getRecentPosts()
  ])

  const statCards = [
    {
      title: '전체 포스트',
      value: stats.totalPosts,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: '게시된 포스트',
      value: stats.publishedPosts,
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      title: '구독자',
      value: stats.totalSubscribers,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: '게시 비율',
      value: stats.totalPosts > 0 
        ? `${Math.round((stats.publishedPosts / stats.totalPosts) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          새 포스트 작성
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">최근 포스트</h2>
        {recentPosts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">포스트가 없습니다</p>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  post.published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.published ? '게시됨' : '초안'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

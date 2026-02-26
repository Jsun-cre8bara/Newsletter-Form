import { adminSupabase } from '@/lib/supabase'
import { Mail, Calendar, Send } from 'lucide-react'
import ExportCSVButton from '@/components/ExportCSVButton'
import NewsletterComposeButton from '@/components/NewsletterComposeButton'
import DeleteSubscriberButton from '@/components/DeleteSubscriberButton'
import SubscriberListWithSelection from '@/components/SubscriberListWithSelection'

async function getSubscribers() {
  const { data, error } = await adminSupabase
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }

  return data || []
}

async function getSendLogs() {
  const { data, error } = await adminSupabase
    .from('newsletter_send_logs')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(10)

  if (error) {
    console.warn('Newsletter send log table missing or query failed:', error.message)
    return []
  }

  return data || []
}

export const revalidate = 0

export default async function SubscribersPage() {
  const subscribers = await getSubscribers()
  const activeSubscribers = subscribers.filter(s => s.active)
  const sendLogs = await getSendLogs()

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">구독자 관리</h1>
        <div className="text-sm text-gray-600">
          총 {activeSubscribers.length}명의 활성 구독자
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">전체 구독자</h3>
          <p className="text-3xl font-bold text-gray-900">{subscribers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">활성 구독자</h3>
          <p className="text-3xl font-bold text-gray-900">{activeSubscribers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm mb-1">이번 달 신규</h3>
          <p className="text-3xl font-bold text-gray-900">
            {subscribers.filter(s => {
              const subDate = new Date(s.subscribed_at)
              const now = new Date()
              return subDate.getMonth() === now.getMonth() && 
                     subDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
      </div>

      {/* Subscribers List */}
      <SubscriberListWithSelection subscribers={subscribers} />

      {/* Send Logs */}
      <div className="mt-10">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">최근 뉴스레터 발송 이력</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {sendLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              아직 발송 이력이 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    포스트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발송 결과
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    발송 시간
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sendLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{log.post_title}</div>
                      <a
                        href={log.post_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 break-all"
                      >
                        {log.post_url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      총 {log.total_count}명 / 성공 {log.sent_count}명 / 실패 {log.failed_count}명
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.sent_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { adminSupabase } from '@/lib/supabase'
import { Mail, Calendar, Send } from 'lucide-react'
import ExportCSVButton from '@/components/ExportCSVButton'
import NewsletterComposeButton from '@/components/NewsletterComposeButton'

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">구독자 관리</h1>
        <div className="text-sm text-gray-600">
          총 {activeSubscribers.length}명의 활성 구독자
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">아직 구독자가 없습니다</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이메일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구독 날짜
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      subscriber.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriber.active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Actions */}
      {subscribers.length > 0 && (
        <div className="mt-6 flex items-center gap-4">
          <NewsletterComposeButton activeSubscriberCount={activeSubscribers.length} />
          <ExportCSVButton subscribers={subscribers} />
        </div>
      )}

      {/* Send Logs */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">최근 뉴스레터 발송 이력</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {sendLogs.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              아직 발송 이력이 없습니다
            </div>
          ) : (
            <table className="w-full">
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
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { MessageSquare, FileText, Clock, Loader } from 'lucide-react'
import { getHistory } from '../api/index'

export default function History() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await getHistory()
      setQueries(res.data)
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader className="animate-spin text-blue-500" size={32} />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Query History</h2>
        <p className="text-gray-400 mt-1">{queries.length} previous quer{queries.length !== 1 ? 'ies' : 'y'}</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 mb-6">
          {error}
        </div>
      )}

      {queries.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">No queries yet — ask your first question!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <MessageSquare className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <p className="text-white font-medium">{item.question}</p>
              </div>
              <p className="text-gray-400 text-sm ml-7 mb-4 line-clamp-3">{item.answer}</p>
              <div className="flex items-center gap-4 ml-7 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
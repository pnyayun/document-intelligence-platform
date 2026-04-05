import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader, FileText } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { askQuestion, getDocuments } from '../api/index'

export default function QueryPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! Select a document and ask me anything about it.' }
  ])
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState('')
  const [searchParams] = useSearchParams()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchDocuments()
    const docId = searchParams.get('doc')
    if (docId) setSelectedDoc(docId)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments()
      setDocuments(res.data)
    } catch (err) {
      console.error('Failed to load documents')
    }
  }

  const handleSend = async () => {
    if (!question.trim() || loading) return

    const userMessage = question
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await askQuestion(selectedDoc || null, userMessage)
      setMessages(prev => [...prev, {
        role: 'bot',
        text: res.data.answer,
        chunks: res.data.chunks_used
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: err.response?.data?.error || 'Sorry, something went wrong. Please try again.',
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Ask AI</h2>
          <p className="text-gray-400 mt-1">Ask questions about your documents</p>
        </div>
        <select
          value={selectedDoc}
          onChange={(e) => setSelectedDoc(e.target.value)}
          className="bg-gray-900 border border-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Documents</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.filename}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-lg flex-shrink-0 ${msg.role === 'bot' ? 'bg-blue-500/10' : 'bg-gray-800'}`}>
              {msg.role === 'bot'
                ? <Bot className="text-blue-500" size={18} />
                : <User className="text-gray-400" size={18} />
              }
            </div>
            <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm ${
              msg.role === 'bot'
                ? msg.error ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-200'
                : 'bg-blue-600 text-white'
            }`}>
              {msg.text}
              {msg.chunks && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Based on {msg.chunks.length} relevant chunk{msg.chunks.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Bot className="text-blue-500" size={18} />
            </div>
            <div className="bg-gray-800 px-4 py-3 rounded-xl">
              <Loader className="animate-spin text-blue-500" size={16} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your document..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !question.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
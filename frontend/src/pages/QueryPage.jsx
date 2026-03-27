import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

export default function QueryPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! Select a document and ask me anything about it.' }
  ])

  const handleSend = () => {
    if (!question.trim()) return
    setMessages(prev => [
      ...prev,
      { role: 'user', text: question },
      { role: 'bot', text: 'This is a placeholder answer. The RAG pipeline will be connected soon.' }
    ])
    setQuestion('')
  }

  return (
    <div className="flex flex-col h-screen p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Ask AI</h2>
        <p className="text-gray-400 mt-1">Ask questions about your documents</p>
      </div>
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-lg ${msg.role === 'bot' ? 'bg-blue-500/10' : 'bg-gray-800'}`}>
              {msg.role === 'bot' ? <Bot className="text-blue-500" size={18} /> : <User className="text-gray-400" size={18} />}
            </div>
            <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm ${
              msg.role === 'bot' ? 'bg-gray-800 text-gray-200' : 'bg-blue-600 text-white'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your document..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
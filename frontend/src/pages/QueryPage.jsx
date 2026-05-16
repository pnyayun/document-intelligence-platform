import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader, ChevronDown } from 'lucide-react'
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
    const fetchDocuments = async () => {
      try {
        const res = await getDocuments()
        setDocuments(res.data)
      } catch {
        console.error('Failed to load documents')
      }
    }
    fetchDocuments()
    const docId = searchParams.get('doc')
    if (docId) setSelectedDoc(docId)
  }, [searchParams])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        text: err.response?.data?.error || 'Sorry, something went wrong.',
        error: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const selectedDocName = documents.find(d => d.id === selectedDoc)?.filename || null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg-base)',
    }}>

      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'Sora, sans-serif',
          }}>
            Ask AI
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Ask questions about your documents
          </p>
        </div>

        {/* Document selector */}
        <div style={{ position: 'relative' }}>
          <select
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
            style={{
              appearance: 'none',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 36px 8px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              minWidth: 180,
            }}
          >
            <option value="">All Documents</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.filename}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '28px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        backgroundColor: 'var(--bg-base)',
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className="animate-fade-up"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: msg.role === 'bot' ? 'var(--accent-light)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {msg.role === 'bot'
                ? <Bot size={16} color="var(--accent)" />
                : <User size={16} color="white" />}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: '60%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user'
                ? '16px 4px 16px 16px'
                : '4px 16px 16px 16px',
              backgroundColor: msg.role === 'user'
                ? 'var(--accent)'
                : msg.error
                  ? 'var(--error-light)'
                  : 'var(--bg-surface)',
              border: msg.role === 'user'
                ? 'none'
                : `1px solid ${msg.error ? 'var(--error)' : 'var(--border)'}`,
              color: msg.role === 'user'
                ? 'white'
                : msg.error
                  ? 'var(--error)'
                  : 'var(--text-primary)',
              fontSize: 14,
              lineHeight: 1.7,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {msg.text}
              {msg.chunks && (
                <div style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTop: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
                  fontSize: 11,
                  color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                }}>
                  Based on {msg.chunks.length} relevant chunk{msg.chunks.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: 10,
              backgroundColor: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={16} color="var(--accent)" />
            </div>
            <div style={{
              padding: '14px 18px',
              borderRadius: '4px 16px 16px 16px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Loader size={14} className="animate-spin" color="var(--accent)" />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '16px 40px 24px',
        borderTop: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
        flexShrink: 0,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}>
        {selectedDocName && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 2 }}>
            Querying: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{selectedDocName}</span>
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about your document..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '13px 18px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={handleSend}
            disabled={loading || !question.trim()}
            style={{
              width: 46, height: 46,
              borderRadius: 'var(--radius)',
              border: 'none',
              backgroundColor: loading || !question.trim() ? 'var(--bg-subtle)' : 'var(--accent)',
              color: loading || !question.trim() ? 'var(--text-muted)' : 'white',
              cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              boxShadow: loading || !question.trim() ? 'none' : '0 2px 8px rgba(79,70,229,0.3)',
            }}
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
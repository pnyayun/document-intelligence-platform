import { useEffect, useState } from 'react'
import { MessageSquare, Clock, Loader, AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { getHistory, deleteQuery } from '../api/index'

export default function History() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getHistory()
        setQueries(res.data)
      } catch {
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await deleteQuery(id)
      setQueries(prev => prev.filter(q => q.id !== id))
      if (expanded === id) setExpanded(null)
    } catch {
      setError('Failed to delete query')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: 40,
      backgroundColor: 'var(--bg-base)',
    }}>
      <Loader className="animate-spin" size={28} color="var(--accent)" />
    </div>
  )

  return (
    <div style={{
      padding: '36px 48px',
      maxWidth: 860,
      margin: '0 auto',
      backgroundColor: 'var(--bg-base)',
      minHeight: '100vh',
    }}>

      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <h2 style={{
          fontSize: 22, fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'Sora, sans-serif',
          marginBottom: 4,
        }}>
          Query History
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {queries.length} previous quer{queries.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {error && (
        <div className="animate-fade-up" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          backgroundColor: 'var(--error-light)',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          marginBottom: 20,
        }}>
          <AlertCircle size={16} color="var(--error)" />
          <p style={{ fontSize: 13, color: 'var(--error)' }}>{error}</p>
        </div>
      )}

      {queries.length === 0 ? (
        <div className="animate-fade-up" style={{
          textAlign: 'center',
          padding: '80px 40px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 14,
            backgroundColor: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <MessageSquare size={24} color="var(--accent)" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            No queries yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Ask your first question to see it appear here
          </p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {queries.map((item) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                transition: 'box-shadow 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            >
              <div
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-surface)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
              >
                <div style={{
                  width: 34, height: 34,
                  borderRadius: 9,
                  backgroundColor: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <MessageSquare size={15} color="var(--accent)" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: 3,
                  }}>
                    {item.question}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} color="var(--text-muted)" />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(item.created_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    width: 30, height: 30,
                    borderRadius: 7,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--error-light)'
                    e.currentTarget.style.color = 'var(--error)'
                    e.currentTarget.style.borderColor = 'var(--error)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {deletingId === item.id
                    ? <Loader size={13} className="animate-spin" />
                    : <Trash2 size={13} />}
                </button>

                <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                  {expanded === item.id
                    ? <ChevronUp size={15} />
                    : <ChevronDown size={15} />}
                </div>
              </div>

              {expanded === item.id && (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '14px 18px 18px 64px',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-subtle)',
                  }}
                >
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {item.answer}
                  </p>
                  {item.chunks_used && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                      Based on {item.chunks_used.length} chunk{item.chunks_used.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
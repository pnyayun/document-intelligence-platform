import { useEffect, useState } from 'react'
import { FileText, Trash2, MessageSquare, Loader, AlertCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDocuments, deleteDocument } from '../api/index'

export default function Documents() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await getDocuments()
        setDocuments(res.data)
      } catch {
        setError('Failed to load documents')
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await deleteDocument(id)
      setDocuments(docs => docs.filter(d => d.id !== id))
    } catch {
      setError('Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const getFileExt = (filename) => filename?.split('.').pop().toUpperCase() || 'FILE'

  const extColors = {
    PDF:  { bg: '#FEF2F2', color: '#DC2626' },
    DOCX: { bg: '#EFF6FF', color: '#2563EB' },
    TXT:  { bg: '#F0FDF4', color: '#16A34A' },
    PPTX: { bg: '#FFF7ED', color: '#EA580C' },
    XLSX: { bg: '#F0FDF4', color: '#16A34A' },
    MD:   { bg: '#FAF5FF', color: '#9333EA' },
    CSV:  { bg: '#F0FDF4', color: '#16A34A' },
    HTML: { bg: '#FFF7ED', color: '#EA580C' },
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 }}>
      <Loader className="animate-spin" size={28} color="var(--accent)" />
    </div>
  )

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Documents
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {documents.length} document{documents.length !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          <Plus size={16} /> Upload New
        </button>
      </div>

      {/* Error */}
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

      {/* Empty State */}
      {documents.length === 0 ? (
        <div className="animate-fade-up" style={{
          textAlign: 'center',
          padding: '80px 40px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: 16,
            backgroundColor: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <FileText size={28} color="var(--accent)" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            No documents yet
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Upload your first document to get started
          </p>
          <button
            onClick={() => navigate('/upload')}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Upload Document
          </button>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.map((doc) => {
            const ext = getFileExt(doc.filename)
            const style = extColors[ext] || { bg: 'var(--accent-light)', color: 'var(--accent)' }
            return (
              <div
                key={doc.id}
                className="animate-fade-up"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                {/* File type badge */}
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 10,
                  backgroundColor: style.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: style.color, letterSpacing: '0.05em' }}>
                    {ext}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: 3,
                  }}>
                    {doc.filename}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {doc.page_count ? `${doc.page_count} pages · ` : ''}
                    Uploaded {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Ask AI */}
                <button
                  onClick={() => navigate(`/query?doc=${doc.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)'
                    e.currentTarget.style.color = 'var(--accent)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  <MessageSquare size={14} /> Ask AI
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  style={{
                    width: 34, height: 34,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: deletingId === doc.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
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
                  {deletingId === doc.id
                    ? <Loader size={14} className="animate-spin" />
                    : <Trash2 size={14} />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
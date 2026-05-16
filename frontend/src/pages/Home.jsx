import { useEffect, useState } from 'react'
import { FileText, MessageSquare, Upload, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDocuments, getHistory } from '../api/index'

export default function Home() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ documents: 0, queries: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsRes, histRes] = await Promise.all([getDocuments(), getHistory()])
        setStats({ documents: docsRes.data.length, queries: histRes.data.length })
      } catch {
        console.error('Failed to load stats')
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Documents Uploaded', value: stats.documents, icon: FileText,      sub: 'Total files in your library' },
    { label: 'Questions Asked',    value: stats.queries,   icon: MessageSquare, sub: 'Queries across all documents' },
  ]

  const quickActions = [
    {
      title: 'Upload a Document',
      description: 'Add a PDF, Word doc, spreadsheet, or any supported file to your library.',
      icon: Upload,
      action: () => navigate('/upload'),
      label: 'Upload now',
      accent: true,
    },
    {
      title: 'Ask AI a Question',
      description: 'Select a document and get instant answers powered by your content.',
      icon: MessageSquare,
      action: () => navigate('/query'),
      label: 'Start asking',
      accent: false,
    },
  ]

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Welcome back 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Your document intelligence workspace — upload, search, and ask.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {statCards.map(({ label, value, icon: Icon, sub }) => (
          <div
            key={label}
            className="animate-fade-up"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--accent-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={22} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
          Quick Actions
        </h3>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {quickActions.map(({ title, description, icon: Icon, action, label, accent }) => (
            <div
              key={title}
              className="animate-fade-up"
              style={{
                backgroundColor: accent ? 'var(--accent)' : 'var(--bg-surface)',
                border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: accent ? '0 4px 16px rgba(79,70,229,0.25)' : 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onClick={action}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = accent
                  ? '0 8px 24px rgba(79,70,229,0.35)'
                  : 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = accent
                  ? '0 4px 16px rgba(79,70,229,0.25)'
                  : 'var(--shadow-sm)'
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: 10,
                backgroundColor: accent ? 'rgba(255,255,255,0.2)' : 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={accent ? 'white' : 'var(--accent)'} />
              </div>
              <div>
                <div style={{
                  fontSize: 15, fontWeight: 600,
                  color: accent ? 'white' : 'var(--text-primary)',
                  marginBottom: 6,
                }}>
                  {title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: accent ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {description}
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600,
                color: accent ? 'white' : 'var(--accent)',
                marginTop: 4,
              }}>
                {label} <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, X } from 'lucide-react'
import { uploadDocument } from '../api/index'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState(null)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (selected) => {
    if (!selected) return
    setFile(selected)
    setStatus(null)
    setError(null)
    setResponse(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadDocument(formData)
      setResponse(res.data)
      setStatus('success')
      setFile(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          Upload Document
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Upload a file to analyze and query with AI.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className="animate-fade-up"
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '56px 40px',
          textAlign: 'center',
          backgroundColor: dragging ? 'var(--accent-light)' : 'var(--bg-surface)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div style={{
          width: 56, height: 56,
          borderRadius: 14,
          backgroundColor: 'var(--accent-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Upload size={26} color="var(--accent)" />
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Drag and drop your file here
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          PDF, DOCX, TXT, PPTX, XLSX, MD, CSV, HTML supported
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          Maximum file size: 50MB
        </p>
        <div style={{
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-strong)',
          backgroundColor: 'var(--bg-subtle)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}>
          Browse Files
        </div>
        <input
          type="file"
          accept=".pdf,.docx,.txt,.pptx,.xlsx,.md,.csv,.html,.htm,.rtf"
          id="file-input"
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
      </div>

      {/* Selected File */}
      {file && (
        <div
          className="animate-fade-up"
          style={{
            marginTop: 16,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{
            width: 40, height: 40,
            borderRadius: 10,
            backgroundColor: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileText size={20} color="var(--accent)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {file.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={() => handleFileSelect(null) || setFile(null)}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: status === 'uploading' ? 'not-allowed' : 'pointer',
              opacity: status === 'uploading' ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            {status === 'uploading'
              ? <><Loader size={14} className="animate-spin" /> Uploading...</>
              : 'Upload'}
          </button>
        </div>
      )}

      {/* Success */}
      {status === 'success' && response && (
        <div
          className="animate-fade-up"
          style={{
            marginTop: 16,
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={18} color="var(--success)" />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)' }}>
              Document uploaded successfully!
            </p>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
            {response.chunks_created} chunks created and embedded
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Preview: {response.text_preview?.slice(0, 180)}...
          </p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div
          className="animate-fade-up"
          style={{
            marginTop: 16,
            backgroundColor: 'var(--error-light)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <AlertCircle size={18} color="var(--error)" />
          <p style={{ fontSize: 13, color: 'var(--error)' }}>{error}</p>
        </div>
      )}
    </div>
  )
}
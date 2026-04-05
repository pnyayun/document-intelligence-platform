import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { uploadDocument } from '../api/index'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState(null)
  const [response, setResponse] = useState(null)
  const [error, setError] = useState(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
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
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
      setStatus('error')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Upload Document</h2>
        <p className="text-gray-400 mt-1">Upload a document to analyze with AI</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'
        }`}
      >
        <Upload className="mx-auto text-gray-500 mb-4" size={48} />
        <p className="text-white font-medium mb-2">Drag and drop your document here</p>
        <p className="text-gray-400 text-sm mb-2">Supports PDF, DOCX, TXT, PPTX, XLSX, MD, CSV, HTML</p>
        <p className="text-gray-500 text-xs mb-6">Max file size: 50MB</p>
        <input
          type="file"
          accept=".pdf,.docx,.txt,.pptx,.xlsx,.md,.csv,.html,.htm,.rtf"
          className="hidden"
          id="file-input"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label
          htmlFor="file-input"
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
        >
          Browse Files
        </label>
      </div>

      {file && (
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
          <FileText className="text-blue-500" size={24} />
          <div className="flex-1">
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button
            onClick={handleUpload}
            disabled={status === 'uploading'}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {status === 'uploading' ? (
              <><Loader size={16} className="animate-spin" /> Uploading...</>
            ) : 'Upload'}
          </button>
        </div>
      )}

      {status === 'success' && response && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle size={20} />
            <p className="font-medium">Document uploaded successfully!</p>
          </div>
          <p className="text-gray-400 text-sm">Chunks created: {response.chunks_created}</p>
          <p className="text-gray-400 text-sm mt-1">Preview: {response.text_preview?.slice(0, 150)}...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
import { useEffect, useState } from 'react'
import { FileText, Trash2, MessageSquare, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getDocuments, deleteDocument } from '../api/index'

export default function Documents() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments()
      setDocuments(res.data)
    } catch (err) {
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      await deleteDocument(id)
      setDocuments(docs => docs.filter(d => d.id !== id))
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center">
      <Loader className="animate-spin text-blue-500" size={32} />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Documents</h2>
          <p className="text-gray-400 mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Upload New
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 mb-6">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">No documents uploaded yet</p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Upload your first document
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="text-blue-500" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{doc.filename}</p>
                <p className="text-gray-400 text-sm">
                  {doc.page_count ? `${doc.page_count} pages · ` : ''}
                  Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => navigate(`/query?doc=${doc.id}`)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <MessageSquare size={16} />
                Ask AI
              </button>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
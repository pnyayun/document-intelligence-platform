import { FileText, Trash2, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const mockDocs = [
  { id: 1, filename: 'research-paper.pdf', page_count: 12, uploaded_at: '2026-03-26' },
  { id: 2, filename: 'annual-report.pdf', page_count: 45, uploaded_at: '2026-03-25' },
]

export default function Documents() {
  const navigate = useNavigate()
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Documents</h2>
          <p className="text-gray-400 mt-1">Manage your uploaded documents</p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Upload New
        </button>
      </div>
      <div className="space-y-4">
        {mockDocs.map((doc) => (
          <div key={doc.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="text-blue-500" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{doc.filename}</p>
              <p className="text-gray-400 text-sm">{doc.page_count} pages · Uploaded {doc.uploaded_at}</p>
            </div>
            <button
              onClick={() => navigate(`/query?doc=${doc.id}`)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <MessageSquare size={16} />
              Ask AI
            </button>
            <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
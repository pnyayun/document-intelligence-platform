import { FileText, MessageSquare, History, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const stats = [
  { label: 'Documents', value: '0', icon: FileText, color: 'blue' },
  { label: 'Queries Asked', value: '0', icon: MessageSquare, color: 'purple' },
  { label: 'Query History', value: '0', icon: History, color: 'green' },
]

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Welcome to your Document Intelligence Platform</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-4xl font-bold text-white mt-1">{value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${color}-500/10`}>
                <Icon className={`text-${color}-500`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
        <Upload className="mx-auto text-blue-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-white mb-2">Get Started</h3>
        <p className="text-gray-400 mb-6">Upload your first document to start asking AI-powered questions</p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Upload Document
        </button>
      </div>
    </div>
  )
}
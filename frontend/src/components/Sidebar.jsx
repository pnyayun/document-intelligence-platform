import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, MessageSquare, History, Brain } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/query', icon: MessageSquare, label: 'Ask AI' },
  { to: '/history', icon: History, label: 'History' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Brain className="text-blue-500" size={28} />
          <div>
            <h1 className="text-lg font-bold text-white">DocIntel</h1>
            <p className="text-xs text-gray-400">Document Intelligence</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">v1.0.0 · RAG Platform</p>
      </div>
    </aside>
  )
}
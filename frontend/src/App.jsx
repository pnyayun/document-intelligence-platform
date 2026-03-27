import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Documents from './pages/Documents'
import Upload from './pages/Upload'
import QueryPage from './pages/QueryPage'
import History from './pages/History'

export default function App() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/query" element={<QueryPage />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  )
}
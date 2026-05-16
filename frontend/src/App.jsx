import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Documents from './pages/Documents'
import Upload from './pages/Upload'
import QueryPage from './pages/QueryPage'
import History from './pages/History'

export default function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Sidebar dark={dark} setDark={setDark} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload"    element={<Upload />} />
          <Route path="/query"     element={<QueryPage />} />
          <Route path="/history"   element={<History />} />
        </Routes>
      </main>
    </div>
  )
}
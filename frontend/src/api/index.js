import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000
})

export const uploadDocument = (formData) => api.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 120000
})

export const getDocuments = () => api.get('/documents')
export const deleteDocument = (id) => api.delete(`/documents/${id}`)
export const askQuestion = (documentId, question) => api.post('/query', { document_id: documentId, question }, { timeout: 60000 })
export const getHistory = () => api.get('/queries')

export default api
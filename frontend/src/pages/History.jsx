import { MessageSquare, FileText, Clock } from 'lucide-react'

const mockHistory = [
  { id: 1, question: 'What is the main conclusion?', answer: 'The study concludes...', document: 'research-paper.pdf', created_at: '2026-03-26 14:32' },
  { id: 2, question: 'What were the key findings?', answer: 'The key findings include...', document: 'annual-report.pdf', created_at: '2026-03-25 09:15' },
]

export default function History() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Query History</h2>
        <p className="text-gray-400 mt-1">Review your previous AI queries</p>
      </div>
      <div className="space-y-4">
        {mockHistory.map((item) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-3">
              <MessageSquare className="text-blue-500 mt-1" size={18} />
              <p className="text-white font-medium">{item.question}</p>
            </div>
            <p className="text-gray-400 text-sm ml-7 mb-4">{item.answer}</p>
            <div className="flex items-center gap-4 ml-7 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText size={12} />
                {item.document}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {item.created_at}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
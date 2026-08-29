import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs } from '../../components/UI'
import { RequireAdmin } from '../../components/UI'

export default function AdminResults() {
  return (
    <RequireAdmin>
      <Section />
    </RequireAdmin>
  )
}

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = () => {
    setLoading(true)
    api
      .get(`/admin/exam-results?status=${status}&page=${page}&limit=15`)
      .then((res) => {
        setItems(res.data.results)
        setTotalPages(res.data.pagination.totalPages || 1)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, page])

  const pageBtns = []
  for (let i = 1; i <= totalPages; i += 1) pageBtns.push(i)

  return (
    <div>
      <h2 className="heading">Exam Results</h2>
      <p className="sub">Review all candidate exam attempts.</p>
      <AdminTabs current="results" />
      <Alert>{error}</Alert>

      <div className="toolbar">
        <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="all">All Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No exam results found." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th><th>Email</th><th>Exam</th><th>Score</th><th>%</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const u = r.userId || {}
                const ex = r.examId || {}
                const name = u.fullname ? `${u.fullname.firstname || ''} ${u.fullname.lastname || ''}`.trim() : u.email
                return (
                  <tr key={r._id}>
                    <td>{name || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td>{ex.title || '—'}</td>
                    <td>{r.score} / {r.totalMarks}</td>
                    <td>{r.percentage}%</td>
                    <td><Badge kind={r.status === 'Passed' ? 'ok' : 'bad'}>{r.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        {pageBtns.map((p) => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
        ))}
      </div>
    </div>
  )
}

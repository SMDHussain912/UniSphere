import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs, formatDate } from '../../components/UI'
import { RequireAdmin } from '../../components/UI'

export default function AdminApplications() {
  return (
    <RequireAdmin>
      <Section />
    </RequireAdmin>
  )
}

const KIND = { pending: 'warn', under_review: 'info', shortlisted: 'info', accepted: 'ok', rejected: 'bad' }

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rejectMsg, setRejectMsg] = useState('')

  const load = () => {
    api
      .get(`/admin/applications?status=${status}&page=${page}&limit=15`)
      .then((res) => {
        setItems(res.data.applications)
        setTotalPages(res.data.pagination.totalPages || 1)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, page])

  const decide = async (id, action) => {
    setError('')
    try {
      if (action === 'accept') {
        await api.post(`/admin/applications/${id}/accept`)
      } else {
        await api.post(`/admin/applications/${id}/reject`, { adminMessage: rejectMsg })
        setRejectMsg('')
      }
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  const pageBtns = []
  for (let i = 1; i <= totalPages; i += 1) pageBtns.push(i)

  return (
    <div>
      <h2 className="heading">Job Applications</h2>
      <p className="sub">Review and manage applicant submissions.</p>
      <AdminTabs current="applications" />
      <Alert>{error}</Alert>

      <div className="toolbar">
        <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <input className="input" placeholder="Reject message..." value={rejectMsg} onChange={(e) => setRejectMsg(e.target.value)} />
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No applications found." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Job</th><th>Applied</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((app) => (
                <tr key={app._id}>
                  <td>{app.fullname}</td>
                  <td>{app.email}</td>
                  <td>{app.jobId?.title || '—'}</td>
                  <td>{formatDate(app.appliedAt)}</td>
                  <td><Badge kind={KIND[app.status] || 'muted'}>{app.status.replace('_', ' ')}</Badge></td>
                  <td>
                    {app.status !== 'accepted' && (
                      <button className="btn btn-primary btn-sm" style={{ marginRight: 6 }} onClick={() => decide(app._id, 'accept')}>
                        Accept
                      </button>
                    )}
                    {app.status !== 'rejected' && (
                      <button className="btn btn-danger btn-sm" onClick={() => decide(app._id, 'reject')}>
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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

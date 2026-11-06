import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs, formatDate, RequireRole } from '../../components/UI'

export default function AdminHallTickets() {
  return (
    <RequireRole roles={['admin', 'superadmin', 'hallticket_admin']}>
      <Section />
    </RequireRole>
  )
}

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [enrollmentId, setEnrollmentId] = useState('')
  const [filter, setFilter] = useState('all')

  const load = () => {
    api
      .get(`/admin/hall-tickets?status=${filter}&limit=50`)
      .then((res) => setItems(res.data.tickets || res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const generate = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      const res = await api.post('/admin/hall-tickets/generate', { enrollmentId })
      setNotice(res.data.status === 'reprinted'
        ? `Hall ticket ${res.data.hallTicketNumber} was reprinted (issue count: ${res.data.issueCount}).`
        : `Hall ticket ${res.data.hallTicketNumber} generated successfully.`)
      setEnrollmentId('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Hall Ticket Office</h2>
      <p className="sub">Generate and manage hall tickets for confirmed enrollments.</p>
      <AdminTabs current="hall-tickets" />
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>

      <div className="card">
        <h3 className="card-title">Generate / Reprint Hall Ticket</h3>
        <form onSubmit={generate} className="form-grid">
          <input
            className="input"
            placeholder="Enrollment ID (from the Enrollments workspace)"
            value={enrollmentId}
            onChange={(e) => setEnrollmentId(e.target.value)}
            required
          />
          <div><button type="submit" className="btn btn-primary">Generate Hall Ticket</button></div>
        </form>
        <p className="muted mt-sm">Only enrollments with status confirmed and fee paid can receive a hall ticket. Generating for an existing ticket records a reprint.</p>
      </div>

      <div className="toolbar mt">
        <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Tickets</option>
          <option value="issued">Issued</option>
          <option value="reprinted">Reprinted</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No hall tickets found." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Hall Ticket No</th><th>Candidate</th><th>Exam</th><th>Center</th><th>Exam Date</th><th>Status</th><th>Issued</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t._id}>
                  <td><strong>{t.hallTicketNumber}</strong></td>
                  <td>{t.userId?.fullname?.firstname ? `${t.userId.fullname.firstname} ${t.userId.fullname.lastname}` : t.userId?.email || '—'}</td>
                  <td>{t.enrollmentId?.examId?.title || '—'}</td>
                  <td>{t.enrollmentId?.centerId ? `${t.enrollmentId.centerId.name} (${t.enrollmentId.centerId.code})` : '—'}</td>
                  <td>{formatDate(t.examDate)}</td>
                  <td><Badge kind={t.status === 'reprinted' ? 'warn' : 'ok'}>{t.status}</Badge></td>
                  <td>{formatDate(t.issuedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
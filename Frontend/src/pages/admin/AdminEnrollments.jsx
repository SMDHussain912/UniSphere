import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs, formatDate, RequireRole } from '../../components/UI'

export default function AdminEnrollments() {
  return (
    <RequireRole roles={['admin', 'superadmin', 'exam_admin', 'hallticket_admin']}>
      <Section />
    </RequireRole>
  )
}

const KIND = { applied: 'warn', confirmed: 'ok', rejected: 'bad' }

function Section() {
  const [items, setItems] = useState([])
  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState('')
  const [centerId, setCenterId] = useState('')
  const [feePaid, setFeePaid] = useState(true)
  const [message, setMessage] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/admin/enrollments?status=${status}&limit=50`),
      api.get('/admin/exam-centers'),
    ])
      .then(([enRes, cRes]) => {
        setItems(enRes.data.enrollments || enRes.data)
        setCenters(cRes.data || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status])

  const act = async (id, action) => {
    setError('')
    setNotice('')
    try {
      const body = action === 'confirm'
        ? { status: 'confirmed', centerId: centerId || undefined, feePaid, adminMessage: message }
        : { status: 'rejected', adminMessage: message }
      const res = await api.post(`/admin/enrollments/${id}/status`, body)
      if (action === 'confirm' && res.data.hallTicket) {
        setNotice(`Enrollment confirmed. Hall ticket ${res.data.hallTicket.hallTicketNumber} issued automatically.`)
      } else {
        setNotice(`Enrollment ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully.`)
      }
      setMessage('')
      load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Exam Enrollments</h2>
      <p className="sub">Confirm candidate registrations, assign exam centers and record fee payments.</p>
      <AdminTabs current="enrollments" />
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>

      <div className="toolbar">
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="select" value={centerId} onChange={(e) => setCenterId(e.target.value)}>
          <option value="">Assign Center (for confirmation)</option>
          {centers.map((c) => (
            <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
          ))}
        </select>
        <label className="muted">
          <input type="checkbox" checked={feePaid} onChange={(e) => setFeePaid(e.target.checked)} /> Fee paid
        </label>
        <input className="input" placeholder="Message to candidate..." value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No enrollments found." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Reg No</th><th>Candidate</th><th>Exam</th><th>Status</th><th>Fee</th><th>Center</th><th>Enrolled</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((en) => (
                <tr key={en._id}>
                  <td><strong>{en.registrationNumber}</strong></td>
                  <td>{en.userId?.fullname?.firstname ? `${en.userId.fullname.firstname} ${en.userId.fullname.lastname}` : en.userId?.email || '—'}</td>
                  <td>{en.examId?.title || '—'}</td>
                  <td><Badge kind={KIND[en.status] || 'muted'}>{en.status}</Badge></td>
                  <td>{en.feePaid ? <Badge kind="ok">Paid</Badge> : <Badge kind="warn">Pending</Badge>}</td>
                  <td>{en.centerId ? `${en.centerId.name} (${en.centerId.code})` : '—'}</td>
                  <td>{formatDate(en.createdAt)}</td>
                  <td>
                    {en.status !== 'confirmed' && (
                      <button className="btn btn-primary btn-sm" style={{ marginRight: 6 }} onClick={() => act(en._id, 'confirm')}>
                        Confirm
                      </button>
                    )}
                    {en.status !== 'rejected' && (
                      <button className="btn btn-danger btn-sm" onClick={() => act(en._id, 'reject')}>
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
      {selected && <input type="hidden" value={selected} />}
    </div>
  )
}
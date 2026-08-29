import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, formatDate, EmptyState } from '../components/UI'

const KIND = { applied: 'warn', confirmed: 'ok', rejected: 'bad' }

export default function MyEnrollments() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/enrollments')
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">My Exam Enrollments</h2>
      <p className="sub">Track the status of your exam registrations.</p>
      <Alert>{error}</Alert>
      {items.length === 0 ? (
        <EmptyState text="You have not enrolled in any exams yet. Open an exam from the Exams page to enroll." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Registration No</th><th>Exam</th><th>Status</th><th>Fee</th><th>Center</th><th>Message</th><th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {items.map((en) => (
                <tr key={en._id}>
                  <td><strong>{en.registrationNumber}</strong></td>
                  <td>{en.examId?.title || '—'}</td>
                  <td><Badge kind={KIND[en.status] || 'muted'}>{en.status}</Badge></td>
                  <td>{en.feePaid ? <Badge kind="ok">Paid</Badge> : <Badge kind="warn">Pending</Badge>}</td>
                  <td>{en.centerId ? `${en.centerId.name} (${en.centerId.code})` : 'To be assigned'}</td>
                  <td className="muted">{en.adminMessage || '—'}</td>
                  <td>{formatDate(en.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
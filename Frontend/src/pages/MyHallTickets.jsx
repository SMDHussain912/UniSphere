import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, formatDate, EmptyState } from '../components/UI'

export default function MyHallTickets() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/hall-tickets/mine')
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">My Hall Tickets</h2>
      <p className="sub">Download or print your hall tickets for confirmed exams.</p>
      <Alert>{error}</Alert>
      {items.length === 0 ? (
        <EmptyState text="No hall tickets yet. Hall tickets appear here after your enrollment is confirmed by the exam office." />
      ) : (
        <div className="grid-2">
          {items.map((t) => (
            <div className="card ticket" key={t._id}>
              <div className="row-between">
                <h3 className="card-title">Hall Ticket {t.hallTicketNumber}</h3>
                <Badge kind={t.status === 'reprinted' ? 'warn' : 'ok'}>{t.status}</Badge>
              </div>
              <div className="detail-grid mt">
                <span className="k">Exam</span><span>{t.enrollmentId?.examId?.title || '—'}</span>
                <span className="k">Registration No</span><span>{t.enrollmentId?.registrationNumber || '—'}</span>
                <span className="k">Venue</span><span>{t.venue}</span>
                <span className="k">Exam Date</span><span>{formatDate(t.examDate)}</span>
                <span className="k">Reporting Time</span><span>{t.reportingTime}</span>
                <span className="k">Instructions</span><span className="muted">{t.instructions}</span>
                <span className="k">Issued</span><span>{formatDate(t.issuedAt)}</span>
              </div>
              <button type="button" className="btn btn-primary btn-sm mt" onClick={() => window.print()}>
                Print Hall Ticket
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
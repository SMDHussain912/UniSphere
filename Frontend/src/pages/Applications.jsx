import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, EmptyState, RequireAuth, formatDate } from '../components/UI'

export default function Applications() {
  return (
    <RequireAuth>
      <ApplicationsInner />
    </RequireAuth>
  )
}

const KIND = {
  pending: 'warn',
  under_review: 'info',
  shortlisted: 'info',
  accepted: 'ok',
  rejected: 'bad',
}

function ApplicationsInner() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/applications')
      .then((res) => setApps(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">My Applications</h2>
      <p className="sub">Track the status of your job applications.</p>
      <Alert>{error}</Alert>
      {apps.length === 0 && <EmptyState text="You have not applied to any jobs yet." />}
      {apps.map((app) => (
        <div className="card" key={app._id}>
          <div className="row-between">
            <h3 className="card-title">{app.jobId?.title || 'Job'}</h3>
            <Badge kind={KIND[app.status] || 'muted'}>{app.status.replace('_', ' ')}</Badge>
          </div>
          <p className="muted mt">Applied on {formatDate(app.appliedAt)}</p>
          {app.adminMessage && <p className="mt">{app.adminMessage}</p>}
        </div>
      ))}
    </div>
  )
}

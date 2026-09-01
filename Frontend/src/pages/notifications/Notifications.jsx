import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, EmptyState, Badge, formatDate } from '../../components/UI'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/notifications')
      .then((res) => setNotifications(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">Notifications</h2>
      {notifications.length === 0 ? (
        <EmptyState text="No notifications." />
      ) : (
        <div className="list">
          {notifications.map((n) => (
            <div key={n._id} className={`list-item ${n.read ? '' : 'unread'}`}>
              <div className="notification-content">
                <strong>{n.title}</strong>
                <p className="muted small">{n.message}</p>
                <div className="muted small">{formatDate(n.createdAt)}</div>
              </div>
              <Badge kind={n.read ? 'muted' : 'info'}>{n.read ? 'Read' : 'New'}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

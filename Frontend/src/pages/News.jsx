import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, EmptyState, formatDate } from '../components/UI'

export default function News() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/news')
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">News & Notifications</h2>
      <p className="sub">Latest announcements from UniSphere.</p>
      <Alert>{error}</Alert>
      {items.length === 0 && <EmptyState text="No news published yet." />}
      {items.map((item) => (
        <div className="card" key={item._id}>
          <div className="row-between">
            <h3 className="card-title">{item.title}</h3>
            <span className="muted" style={{ fontSize: '0.85rem' }}>{formatDate(item.date)}</span>
          </div>
          <div className="mt"><span className="tag">{item.category}</span></div>
          <p className="muted mt">{item.description}</p>
        </div>
      ))}
    </div>
  )
}

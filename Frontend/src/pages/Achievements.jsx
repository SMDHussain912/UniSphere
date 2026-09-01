import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, EmptyState, Badge } from '../components/UI'

const TIER_COLORS = { bronze: 'info', silver: 'muted', gold: 'gold' }

export default function Achievements() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/my/achievements')
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="container">
      <h1 className="heading">My Achievements</h1>
      <p className="sub">Milestones earned through your learning journey.</p>
      {data.length === 0 ? (
        <EmptyState text="No achievements yet. Keep learning to earn your first one!" />
      ) : (
        <div className="achievements-grid">
          {data.map((a) => (
            <div key={a._id} className="achievement-card">
              <span className="achievement-icon">{a.icon}</span>
              <div>
                <h3 className="achievement-name">{a.name}</h3>
                <p className="achievement-desc">{a.description}</p>
                <Badge kind={TIER_COLORS[a.tier] || 'muted'}>{a.tier}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

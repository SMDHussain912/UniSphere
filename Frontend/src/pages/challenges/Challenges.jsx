import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, EmptyState, Badge } from '../../components/UI'

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/challenges')
      .then((res) => setChallenges(res.data.challenges || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">Practice Arena</h2>
      <p className="sub">Today's coding challenge and daily problems.</p>
      {challenges.length === 0 ? (
        <EmptyState text="No challenges available yet." />
      ) : (
        <div className="grid">
          {challenges.map((c) => (
            <a key={c._id} href={`#/code`} className="card card-hover">
              <div className="card-header">
                <h3 className="card-title">{c.title}</h3>
                <Badge kind={c.difficulty === 'hard' ? 'bad' : c.difficulty === 'medium' ? 'warn' : 'ok'}>
                  {c.difficulty}
                </Badge>
              </div>
              <p className="card-text">{c.description?.slice(0, 120)}...</p>
              <div className="row-between mt">
                <div className="muted small">{c.points} XP</div>
                <div className="muted small">{c.estimatedTime}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

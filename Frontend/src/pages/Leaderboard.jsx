import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, EmptyState, Avatar, Badge } from '../components/UI'

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/leaderboard')
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="container">
      <h1 className="heading">Global Leaderboard</h1>
      <p className="sub">Ranked by learning points accumulated across UniSphere.</p>
      {users.length === 0 ? (
        <EmptyState text="No users on the leaderboard yet." />
      ) : (
        <div className="leaderboard-list">
          {users.map((u, i) => (
            <div key={u._id} className="leaderboard-item">
              <div className="leaderboard-rank">#{i + 1}</div>
              <Avatar name={`${u.fullname.firstname} ${u.fullname.lastname}`} size={36} />
              <div className="leaderboard-name">
                {u.fullname.firstname} {u.fullname.lastname}
                {u.role !== 'user' && <Badge kind="muted">{u.role}</Badge>}
              </div>
              <div className="leaderboard-points">{u.learningPoints} pts</div>
              {u.badges.length > 0 && (
                <div className="leaderboard-badges">
                  {u.badges.map((b) => <Badge key={b} kind="gold">{b}</Badge>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

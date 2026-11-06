import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, EmptyState, Badge } from '../../components/UI'

export default function Community() {
  const [discussions, setDiscussions] = useState([])
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/community/discussions').catch(() => ({ data: { discussions: [] } })),
      api.get('/community/communities').catch(() => ({ data: { communities: [] } })),
    ])
      .then(([d, c]) => {
        setDiscussions(d.data.discussions || [])
        setCommunities(c.data.communities || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="community-layout">
      <main className="community-main">
        <h2 className="heading">Community</h2>
        <p className="sub">Learn together, discuss, and collaborate.</p>
        {communities.length > 0 && (
          <div className="mt">
            <h3 className="card-title">Popular Communities</h3>
            <div className="grid">
              {communities.map((c) => (
                <a key={c._id} href={`#/community/c/${c.slug}`} className="card card-hover">
                  <h3 className="card-title">{c.name}</h3>
                  <Badge kind="muted">{c.members} members</Badge>
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="mt">
          <h3 className="card-title">Trending Discussions</h3>
          {discussions.length === 0 ? (
            <EmptyState text="No discussions yet." />
          ) : (
            <div className="list">
              {discussions.map((d) => (
                <a key={d._id} href={`#/community/d/${d.slug}`} className="list-item">
                  <div>
                    <h4>{d.title}</h4>
                    <div className="muted small">{d.answers?.length || 0} replies</div>
                  </div>
                  <Badge kind="info">{d.category}</Badge>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <aside className="community-sidebar">
        <h3 className="card-title">Study Groups</h3>
        <p className="sub">Join a group to study with others.</p>
      </aside>
    </div>
  )
}

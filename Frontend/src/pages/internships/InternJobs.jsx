import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, EmptyState, Badge } from '../../components/UI'

export default function InternJobs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('jobs')

  useEffect(() => {
    api
      .get(`/jobs?type=${type}`)
      .then((res) => setItems(res.data.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [type])

  if (loading) return <Loader />

  return (
    <div>
      <div className="row-between mb">
        <h2 className="heading">
          {type === 'jobs' ? 'Job Opportunities' : 'Internship Programs'}
        </h2>
        <div className="toolbar">
          <button className={`btn btn-ghost btn-sm ${type === 'jobs' ? 'active' : ''}`} onClick={() => setType('jobs')}>
            Jobs
          </button>
          <button className={`btn btn-ghost btn-sm ${type === 'internships' ? 'active' : ''}`} onClick={() => setType('internships')}>
            Internships
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState text={`No ${type === 'jobs' ? 'jobs' : 'internships'} found.`} />
      ) : (
        <div className="grid">
          {items.map((item) => (
            <Card key={item._id} item={item} type={type} />
          ))}
        </div>
      )}
    </div>
  )
}

function Card({ item, type }) {
  return (
    <a href={`#/${type === 'jobs' ? 'jobs' : 'internships'}/${item._id}`} className="card card-hover">
      <div className="card-header">
        <h3 className="card-title">{item.title}</h3>
        <Badge kind="info">{item.category}</Badge>
      </div>
      <p className="muted">{item.organization} · {item.location}</p>
      <p className="card-text mt-sm">{item.description?.slice(0, 100)}...</p>
      <div className="row-between mt">
        <Badge kind={type === 'jobs' ? 'ok' : 'info'}>{type === 'jobs' ? 'Job' : 'Internship'}</Badge>
        <div className="muted small">{item.salary || 'Competitive'}</div>
      </div>
    </a>
  )
}

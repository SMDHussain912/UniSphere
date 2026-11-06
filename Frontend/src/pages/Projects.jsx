import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, EmptyState, Pagination } from '../components/UI'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

const kindFor = (d) => (d === 'beginner' ? 'ok' : d === 'advanced' ? 'warn' : 'info')

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [q, setQ] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [skillKey, setSkillKey] = useState('')
  const [query, setQuery] = useState({})

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '9' })
    if (query.q) params.set('q', query.q)
    if (query.difficulty && query.difficulty !== 'all') params.set('difficulty', query.difficulty)
    if (query.skillKey) params.set('skillKey', query.skillKey)
    api
      .get(`/projects?${params.toString()}`)
      .then((res) => {
        setProjects(res.data.projects || [])
        setTotalPages(res.data.pagination?.totalPages || 1)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, query])

  const apply = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery({ q, difficulty, skillKey })
  }

  return (
    <div>
      <h2 className="heading">Build Something</h2>
      <p className="sub">Build real projects that prove what you can do and earn verified skill evidence.</p>
      <form className="toolbar" onSubmit={apply}>
        <input className="input" placeholder="Search projects..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="all">All Levels</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
        <input className="input" placeholder="Skill (e.g. python)" value={skillKey} onChange={(e) => setSkillKey(e.target.value)} />
        <button className="btn btn-primary">Search</button>
      </form>
      <Alert>{error}</Alert>
      {loading ? (
        <Loader />
      ) : projects.length === 0 ? (
        <EmptyState text="No projects match your filters." />
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <div className="card" key={p._id}>
              <div className="row-between">
                <h3 className="card-title">{p.title}</h3>
                <Badge kind={kindFor(p.difficulty)}>{p.difficulty}</Badge>
              </div>
              <p className="muted mt">{p.description}</p>
              <div className="meta">
                {(p.skillKeys || []).map((s) => (
                  <span className="tag" key={s}>{s}</span>
                ))}
              </div>
              <p className="muted mt">
                {p.totalPoints} points &nbsp;•&nbsp; ~{p.estimatedHours}h estimated
              </p>
              <div className="mt">
                <a href={`#/projects/${p.slug}`} className="btn btn-primary btn-sm">Start Project</a>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

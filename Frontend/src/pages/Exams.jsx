import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, EmptyState, Pagination, formatDate } from '../components/UI'

export default function Exams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState({})

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: '9' })
    if (query.search) params.set('search', query.search)
    if (query.category && query.category !== 'all') params.set('category', query.category)
    api
      .get(`/exams?${params.toString()}`)
      .then((res) => {
        setExams(res.data.exams)
        setTotalPages(res.data.pagination.totalPages || 1)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, query])

  const applyFilters = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery({ search, category })
  }

  const statusKind = (s) => (s === 'Active' ? 'ok' : s === 'Inactive' ? 'warn' : 'bad')

  return (
    <div>
      <h2 className="heading">Upcoming Exams</h2>
      <p className="sub">Browse exams and start taking them online.</p>
      <form className="toolbar" onSubmit={applyFilters}>
        <input className="input" placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Aptitude">Aptitude</option>
          <option value="Technical">Technical</option>
          <option value="General">General</option>
          <option value="English">English</option>
        </select>
        <button className="btn btn-primary">Search</button>
      </form>
      <Alert>{error}</Alert>
      {loading ? (
        <Loader />
      ) : exams.length === 0 ? (
        <EmptyState text="No exams match your search." />
      ) : (
        <div className="grid">
          {exams.map((exam) => (
            <div className="card" key={exam._id}>
              <div className="row-between">
                <h3 className="card-title">{exam.title}</h3>
                <Badge kind={statusKind(exam.status)}>{exam.status}</Badge>
              </div>
              <div className="muted mt">{exam.organization}</div>
              <div className="meta">
                <span className="tag">{exam.category}</span>
                <span className="tag">{exam.durationMinutes} min</span>
                <span className="tag">{exam.totalMarks} marks</span>
              </div>
              <p className="muted mt">Last date to apply: {formatDate(exam.lastDate)}</p>
              <div className="mt">
                <a href={`#/exams/${exam._id}`} className="btn btn-primary btn-sm">View Details</a>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

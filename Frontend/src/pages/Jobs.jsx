import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, EmptyState, Pagination, formatDate } from '../components/UI'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [employmentType, setEmploymentType] = useState('all')
  const [query, setQuery] = useState({})

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page, limit: '9' })
    if (query.search) params.set('search', query.search)
    if (query.category && query.category !== 'all') params.set('category', query.category)
    if (query.employmentType && query.employmentType !== 'all') params.set('employmentType', query.employmentType)
    api
      .get(`/jobs?${params.toString()}`)
      .then((res) => {
        setJobs(res.data.jobs)
        setTotalPages(res.data.pagination.totalPages || 1)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, query])

  const apply = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery({ search, category, employmentType })
  }

  return (
    <div>
      <h2 className="heading">Open Jobs</h2>
      <p className="sub">Find your next opportunity at UniSphere.</p>
      <form className="toolbar" onSubmit={apply}>
        <input className="input" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Operations">Operations</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
          <option value="Other">Other</option>
        </select>
        <select className="select" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
        <button className="btn btn-primary">Search</button>
      </form>
      <Alert>{error}</Alert>
      {loading ? (
        <Loader />
      ) : jobs.length === 0 ? (
        <EmptyState text="No jobs match your filters." />
      ) : (
        <div className="grid">
          {jobs.map((job) => (
            <div className="card" key={job._id}>
              <div className="row-between">
                <div>
                  <h3 className="card-title">{job.title}</h3>
                  <div className="muted">{job.organization}</div>
                </div>
                <Badge kind={job.status === 'Active' ? 'ok' : 'muted'}>{job.status}</Badge>
              </div>
              <div className="meta">
                <span className="tag">{job.category}</span>
                <span className="tag">{job.employmentType}</span>
                <span className="tag">{job.location}</span>
              </div>
              <p className="muted mt">Salary: {job.salary} &nbsp;•&nbsp; Vacancies: {job.vacancies}</p>
              <div className="mt">
                <a href={`#/jobs/${job._id}`} className="btn btn-primary btn-sm">View Details</a>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}

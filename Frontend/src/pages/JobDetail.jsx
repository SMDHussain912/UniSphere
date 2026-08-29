import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, formatDate } from '../components/UI'

export default function JobDetail({ id }) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!job) return <Alert>{error}</Alert>

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="card">
        <div className="row-between">
          <div>
            <h2 className="heading">{job.title}</h2>
            <p className="muted">{job.organization} • {job.location}</p>
          </div>
          <Badge kind={job.status === 'Active' ? 'ok' : 'muted'}>{job.status}</Badge>
        </div>
        <p className="mt">{job.description}</p>
        <div className="meta">
          <span className="tag">{job.category}</span>
          <span className="tag">{job.employmentType}</span>
          <span className="tag">{job.experienceRequired}</span>
        </div>
      </div>

      <div className="card mt">
        <div className="detail-grid">
          <span className="k">Salary</span><span>{job.salary}</span>
          <span className="k">Vacancies</span><span>{job.vacancies}</span>
          <span className="k">Qualification</span><span>{job.qualification}</span>
          <span className="k">Experience</span><span>{job.experienceRequired}</span>
          <span className="k">Last Date to Apply</span><span>{formatDate(job.lastDate)}</span>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="card mt">
          <h3 className="card-title">Required Skills</h3>
          <div className="meta">
            {job.skills.map((s, i) => (
              <span className="tag" key={i}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt">
        <a href={`#/jobs/${job._id}/apply`} className="btn btn-primary">Apply Now</a>
      </div>
    </div>
  )
}

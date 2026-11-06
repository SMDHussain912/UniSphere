import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, Field, AdminTabs, formatDate } from '../../components/UI'
import { RequireAdmin } from '../../components/UI'

export default function AdminJobs() {
  return (
    <RequireAdmin>
      <Section />
    </RequireAdmin>
  )
}

const EMPTY = {
  title: '', organization: 'UniSphere', category: 'Technology', status: 'Active', description: '',
  qualification: '', experienceRequired: 'Fresher', salary: 'Negotiable', vacancies: '1',
  employmentType: 'Full Time', skills: '', lastDate: '', location: '',
}

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = () => {
    api
      .get('/jobs?limit=100')
      .then((res) => setItems(res.data.jobs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = { ...form }
      payload.skills = form.skills.split(',').map((s) => s.trim()).filter(Boolean)
      if (!payload.skills.length) delete payload.skills
      await api.post('/jobs', payload)
      setForm(EMPTY)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this job?')) return
    try {
      await api.del(`/jobs/${id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Manage Jobs</h2>
      <p className="sub">Create and manage job openings.</p>
      <AdminTabs current="jobs" />
      <Alert>{error}</Alert>

      <button className="btn btn-primary mb" onClick={() => setShowForm((v) => !v)}>
        {showForm ? 'Close Form' : '+ New Job'}
      </button>

      {showForm && (
        <form className="card form mb" onSubmit={create}>
          <h3 className="card-title">New Job</h3>
          <div className="grid">
            <Field label="Title"><input className="input" required value={form.title} onChange={setF('title')} /></Field>
            <Field label="Organization"><input className="input" value={form.organization} onChange={setF('organization')} /></Field>
            <Field label="Category">
              <select className="select" value={form.category} onChange={setF('category')}>
                <option>Technology</option><option>Operations</option><option>Sales</option><option>Support</option><option>Other</option>
              </select>
            </Field>
            <Field label="Employment Type">
              <select className="select" value={form.employmentType} onChange={setF('employmentType')}>
                <option>Full Time</option><option>Part Time</option><option>Contract</option><option>Internship</option>
              </select>
            </Field>
            <Field label="Qualification"><input className="input" required value={form.qualification} onChange={setF('qualification')} /></Field>
            <Field label="Experience"><input className="input" value={form.experienceRequired} onChange={setF('experienceRequired')} /></Field>
            <Field label="Salary"><input className="input" value={form.salary} onChange={setF('salary')} /></Field>
            <Field label="Vacancies"><input className="input" type="number" value={form.vacancies} onChange={setF('vacancies')} /></Field>
            <Field label="Location"><input className="input" required value={form.location} onChange={setF('location')} /></Field>
            <Field label="Last Date to Apply"><input className="input" type="date" required value={form.lastDate} onChange={setF('lastDate')} /></Field>
          </div>
          <Field label="Skills (comma separated)"><input className="input" value={form.skills} onChange={setF('skills')} /></Field>
          <Field label="Description"><textarea className="input" required value={form.description} onChange={setF('description')} /></Field>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Create Job'}</button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No jobs created yet." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>Org</th><th>Category</th><th>Type</th><th>Location</th><th>Last Date</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((job) => (
                <tr key={job._id}>
                  <td>{job.title}</td>
                  <td>{job.organization}</td>
                  <td>{job.category}</td>
                  <td>{job.employmentType}</td>
                  <td>{job.location}</td>
                  <td>{formatDate(job.lastDate)}</td>
                  <td><Badge kind={job.status === 'Active' ? 'ok' : 'muted'}>{job.status}</Badge></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(job._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

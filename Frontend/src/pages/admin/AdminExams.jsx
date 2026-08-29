import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, Field, AdminTabs, formatDate } from '../../components/UI'
import { RequireAdmin } from '../../components/UI'

export default function AdminExams() {
  return (
    <RequireAdmin>
      <Section />
    </RequireAdmin>
  )
}

const EMPTY = {
  title: '', description: '', category: '', qualification: '', durationMinutes: '',
  totalMarks: '', passingMarks: '', vacancies: '', applicationFee: '',
  examDate: '', lastDate: '', status: 'Active', syllabus: '', examPattern: '',
}

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    api
      .get('/exams?limit=100')
      .then((res) => setItems(res.data.exams))
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
      Object.keys(EMPTY).forEach((k) => {
        if (payload[k] === '') delete payload[k]
      })
      await api.post('/exams', payload)
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
    if (!window.confirm('Delete this exam and its questions?')) return
    try {
      await api.del(`/exams/${id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const kind = (s) => (s === 'Active' ? 'ok' : s === 'Inactive' ? 'warn' : 'bad')

  return (
    <div>
      <h2 className="heading">Manage Exams</h2>
      <p className="sub">Create and manage online exams.</p>
      <AdminTabs current="exams" />
      <Alert>{error}</Alert>

      <button className="btn btn-primary mb" onClick={() => setShowForm((v) => !v)}>
        {showForm ? 'Close Form' : '+ New Exam'}
      </button>

      {showForm && (
        <form className="card form mb" onSubmit={create}>
          <h3 className="card-title">New Exam</h3>
          <div className="grid">
            <Field label="Title"><input className="input" required value={form.title} onChange={setF('title')} /></Field>
            <Field label="Category"><input className="input" required value={form.category} onChange={setF('category')} /></Field>
            <Field label="Qualification"><input className="input" required value={form.qualification} onChange={setF('qualification')} /></Field>
            <Field label="Duration (minutes)"><input className="input" type="number" required value={form.durationMinutes} onChange={setF('durationMinutes')} /></Field>
            <Field label="Total Marks"><input className="input" type="number" required value={form.totalMarks} onChange={setF('totalMarks')} /></Field>
            <Field label="Passing Marks"><input className="input" type="number" required value={form.passingMarks} onChange={setF('passingMarks')} /></Field>
            <Field label="Vacancies"><input className="input" type="number" value={form.vacancies} onChange={setF('vacancies')} /></Field>
            <Field label="Application Fee"><input className="input" type="number" value={form.applicationFee} onChange={setF('applicationFee')} /></Field>
            <Field label="Exam Date"><input className="input" type="date" value={form.examDate} onChange={setF('examDate')} /></Field>
            <Field label="Last Date to Apply"><input className="input" type="date" required value={form.lastDate} onChange={setF('lastDate')} /></Field>
          </div>
          <Field label="Description"><textarea className="input" required value={form.description} onChange={setF('description')} /></Field>
          <div className="grid">
            <Field label="Exam Pattern"><textarea className="input" value={form.examPattern} onChange={setF('examPattern')} /></Field>
            <Field label="Syllabus"><textarea className="input" value={form.syllabus} onChange={setF('syllabus')} /></Field>
          </div>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Create Exam'}</button>
        </form>
      )}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No exams created yet." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Marks</th><th>Pass</th><th>Duration</th><th>Last Date</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((exam) => (
                <tr key={exam._id}>
                  <td>{exam.title}</td>
                  <td>{exam.category}</td>
                  <td>{exam.totalMarks}</td>
                  <td>{exam.passingMarks}</td>
                  <td>{exam.durationMinutes} min</td>
                  <td>{formatDate(exam.lastDate)}</td>
                  <td><Badge kind={kind(exam.status)}>{exam.status}</Badge></td>
                  <td>
                    <a href={`#/admin/exams/${exam._id}/questions`} className="link" style={{ marginRight: 10 }}>Questions</a>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(exam._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

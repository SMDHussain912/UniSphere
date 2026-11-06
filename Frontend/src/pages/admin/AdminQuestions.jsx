import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, EmptyState, Field, formatDate } from '../../components/UI'
import { RequireAdmin } from '../../components/UI'

export default function AdminQuestions({ id }) {
  return (
    <RequireAdmin>
      <Section examId={id} />
    </RequireAdmin>
  )
}

const EMPTY = { question: '', options: '', correctAnswer: '0', marks: '1' }

function Section({ examId }) {
  const [items, setItems] = useState([])
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api
      .get(`/questions?examId=${examId}&limit=500`)
      .then((res) => setItems(res.data.questions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [examId])

  useEffect(() => {
    api.get(`/exams/${examId}`).then((res) => setExam(res.data)).catch(() => {})
    load()
  }, [examId, load])

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const payload = {
        examId,
        question: form.question,
        options: form.options.split(',').map((s) => s.trim()).filter(Boolean),
        correctAnswer: Number(form.correctAnswer),
        marks: Number(form.marks) || 1,
      }
      await api.post('/questions', payload)
      setForm(EMPTY)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (qid) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await api.del(`/questions/${qid}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <p className="muted"><a href="#/admin/exams" className="link">← Back to Exams</a></p>
      <h2 className="heading">Questions — {exam ? exam.title : 'Exam'}</h2>
      <p className="sub">{items.length} questions • created {exam ? formatDate(exam.createdAt) : ''}</p>
      <Alert>{error}</Alert>

      <form className="card form mb" onSubmit={create}>
        <h3 className="card-title">Add Question</h3>
        <Field label="Question"><textarea className="input" required value={form.question} onChange={setF('question')} /></Field>
        <Field label="Options (comma separated)">
          <input className="input" required placeholder="Option A, Option B, Option C" value={form.options} onChange={setF('options')} />
        </Field>
        <div className="grid">
          <Field label="Correct Answer (index)"><input className="input" type="number" min="0" value={form.correctAnswer} onChange={setF('correctAnswer')} /></Field>
          <Field label="Marks"><input className="input" type="number" min="0" value={form.marks} onChange={setF('marks')} /></Field>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Adding...' : 'Add Question'}</button>
      </form>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No questions added yet." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Question</th><th>Options</th><th>Correct</th><th>Marks</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q._id}>
                  <td>{q.question}</td>
                  <td>{q.options.join(' | ')}</td>
                  <td>{q.correctAnswer}</td>
                  <td>{q.marks}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(q._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs, formatDate, RequireRole } from '../../components/UI'

export default function AdminPapers() {
  return (
    <RequireRole roles={['admin', 'superadmin', 'question_admin']}>
      <Section />
    </RequireRole>
  )
}

const KIND = { Draft: 'muted', Published: 'ok', Closed: 'bad' }

function Section() {
  const [exams, setExams] = useState([])
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ examId: '', title: '', paperType: 'MCQ', setCode: '' })
  const [expanded, setExpanded] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/exams?limit=100'), api.get('/admin/question-papers?limit=50')])
      .then(([exRes, ppRes]) => {
        setExams(exRes.data.exams || exRes.data || [])
        setPapers(ppRes.data.papers || ppRes.data || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.post('/admin/question-papers', {
        examId: form.examId,
        title: form.title,
        paperType: form.paperType,
        setCode: form.setCode || undefined,
      })
      setNotice('Question paper created as Draft. Add questions from the Exams workspace, then upload the answer key.')
      setForm({ examId: '', title: '', paperType: 'MCQ', setCode: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const uploadKey = async (paperId, file) => {
    setError('')
    setNotice('')
    try {
      const fd = new FormData()
      fd.append('answerKey', file)
      await api.post(`/admin/question-papers/${paperId}/answer-key`, fd)
      setNotice('Answer key uploaded.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const publishKey = async (paperId) => {
    setError('')
    setNotice('')
    try {
      await api.post(`/admin/question-papers/${paperId}/answer-key/publish`)
      setNotice('Answer key published to candidates.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const setStatus = async (paperId, status) => {
    setError('')
    setNotice('')
    try {
      await api.put(`/admin/question-papers/${paperId}/status`, { status })
      setNotice(`Paper marked ${status}.`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (paperId) => {
    setError('')
    try {
      await api.del(`/admin/question-papers/${paperId}`)
      setNotice('Paper deleted.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Question Paper Office</h2>
      <p className="sub">Create papers per exam set, upload official answer keys and publish them after the exam.</p>
      <AdminTabs current="papers" />
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>
      <PaperForm form={form} setForm={setForm} exams={exams} onSubmit={create} />
      <PaperList papers={papers} loading={loading} expanded={expanded} setExpanded={setExpanded} onUpload={uploadKey} onPublish={publishKey} onStatus={setStatus} onDelete={remove} />
    </div>
  )
function PaperForm({ form, setForm, exams, onSubmit }) {
  return (
    <div className="card">
      <h3 className="card-title">Create Question Paper</h3>
      <form onSubmit={onSubmit} className="form-grid">
        <select className="select" value={form.examId} onChange={(e) => setForm({ ...form, examId: e.target.value })} required>
          <option value="">Select exam</option>
          {exams.map((ex) => (
            <option key={ex._id} value={ex._id}>{ex.title}</option>
          ))}
        </select>
        <input className="input" placeholder="Paper title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <select className="select" value={form.paperType} onChange={(e) => setForm({ ...form, paperType: e.target.value })}>
          <option value="MCQ">MCQ</option>
          <option value="Descriptive">Descriptive</option>
          <option value="Mixed">Mixed</option>
        </select>
        <input className="input" placeholder="Set code (A, B...)" value={form.setCode} onChange={(e) => setForm({ ...form, setCode: e.target.value })} />
        <div><button type="submit" className="btn btn-primary">Create Paper</button></div>
      </form>
    </div>
  )
}

function PaperList({ papers, loading, expanded, setExpanded, onUpload, onPublish, onStatus, onDelete }) {
  if (loading) return <Loader />
  if (papers.length === 0) return <EmptyState text="No question papers yet." />
  return (
    <div className="mt">
      {papers.map((p) => (
        <div className="card mt" key={p._id}>
          <div className="row-between">
            <div>
              <strong>{p.title}</strong>
              <div className="muted">
                {p.examId?.title || '—'} {p.setCode ? `Set ${p.setCode}` : ''} {p.totalMarks ? `${p.totalMarks} marks` : ''} {p.questionCount ? `${p.questionCount} questions` : ''}
              </div>
            </div>
            <div>
              <Badge kind={KIND[p.status] || 'muted'}>{p.status}</Badge>
              {p.answerKey?.published && <Badge kind="info">Key Published</Badge>}
              {p.answerKey?.uploaded && !p.answerKey?.published && <Badge kind="warn">Key Uploaded</Badge>}
            </div>
          </div>
          <div className="mt">
            <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => setExpanded(expanded === p._id ? '' : p._id)}>
              {expanded === p._id ? 'Hide Actions' : 'Manage'}
            </button>
            {p.status === 'Draft' && (
              <button className="btn btn-primary btn-sm" style={{ marginRight: 6 }} onClick={() => onStatus(p._id, 'Published')}>Publish</button>
            )}
            {p.status === 'Published' && (
              <button className="btn btn-danger btn-sm" style={{ marginRight: 6 }} onClick={() => onStatus(p._id, 'Closed')}>Close</button>
            )}
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(p._id)}>Delete</button>
          </div>
          {expanded === p._id && (
            <div className="mt">
              <div className="field">
                <label>Official Answer Key (PDF or image)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" onChange={(e) => e.target.files[0] && onUpload(p._id, e.target.files[0])} />
              </div>
              {p.answerKey?.uploaded && (
                <p className="muted mt-sm">
                  Uploaded {formatDate(p.answerKey.uploadedAt)} {p.answerKey.originalName ? `(${p.answerKey.originalName})` : ''}{' '}
                  {!p.answerKey.published && (
                    <button className="btn btn-primary btn-sm" onClick={() => onPublish(p._id)}>Publish Answer Key</button>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
}
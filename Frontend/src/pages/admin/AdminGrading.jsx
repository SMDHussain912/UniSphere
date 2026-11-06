import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs, RequireRole } from '../../components/UI'

export default function AdminGrading() {
  return (
    <RequireRole roles={['admin', 'superadmin', 'grader_admin']}>
      <Section />
    </RequireRole>
  )
}

function Section() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [status, setStatus] = useState('pending')
  const [detail, setDetail] = useState(null)
  const [marks, setMarks] = useState({})
  const [feedback, setFeedback] = useState('')

  const load = useCallback(() => {
    api
      .get(`/admin/grading?status=${status}&limit=50`)
      .then((res) => setSheets(res.data.sheets || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const open = async (id) => {
    setError('')
    try {
      const res = await api.get(`/admin/grading/${id}`)
      setDetail(res.data)
      const initial = {}
      ;(res.data.marks || []).forEach((m) => { initial[m.questionId] = m.awarded })
      setMarks(initial)
      setFeedback(res.data.feedback || '')
    } catch (err) {
      setError(err.message)
    }
  }

  const submitScore = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      const payload = {
        marks: Object.entries(marks).map(([questionId, awarded]) => ({ questionId, awarded: Number(awarded) })),
        feedback,
      }
      const res = await api.post(`/admin/grading/${detail._id}/score`, payload)
      setNotice(`Sheet graded. Auto ${res.data.autoScore} + Manual ${res.data.manualMarks} = ${res.data.totalMarks}. Result published to the candidate.`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Answer Sheet Verification</h2>
      <p className="sub">Review submitted answers, award descriptive marks and publish final results.</p>
      <AdminTabs current="grading" />
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>
      <div className="toolbar">
        <select className="select" value={status} onChange={(e) => {
          setDetail(null)
          setStatus(e.target.value)
        }}>
          <option value="pending">Pending Verification</option>
          <option value="graded">Graded</option>
          <option value="all">All</option>
        </select>
      </div>
      <SheetTable sheets={sheets} loading={loading} onOpen={open} />
      {detail && (
        <SheetDetail detail={detail} marks={marks} setMarks={setMarks} feedback={feedback} setFeedback={setFeedback} onSubmit={submitScore} />
      )}
    </div>
  )
}
function SheetTable({ sheets, loading, onOpen }) {
  if (loading) return <Loader />
  if (sheets.length === 0) return <EmptyState text="No answer sheets found for this filter." />
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Candidate</th><th>Exam</th><th>Submitted</th><th>Auto Score</th><th>Total</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sheets.map((s) => (
            <tr key={s._id}>
              <td>{s.userId?.fullname?.firstname ? `${s.userId.fullname.firstname} ${s.userId.fullname.lastname}` : s.userId?.email || '—'}</td>
              <td>{s.examId?.title || '—'}</td>
              <td>{new Date(s.submittedAt).toLocaleString()}</td>
              <td>{s.autoScore}</td>
              <td><strong>{s.totalMarks ?? '—'}</strong></td>
              <td><Badge kind={s.status === 'graded' ? 'ok' : 'warn'}>{s.status}</Badge></td>
              <td><button className="btn btn-primary btn-sm" onClick={() => onOpen(s._id)}>{s.status === 'graded' ? 'Review' : 'Verify'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SheetDetail({ detail, marks, setMarks, feedback, setFeedback, onSubmit }) {
  return (
    <div className="card mt">
      <div className="row-between">
        <h3 className="card-title">Verify Sheet — {detail.examId?.title}</h3>
        <Badge kind="info">Auto Score: {detail.autoScore}</Badge>
      </div>
      <div className="table-wrap mt">
        <table className="table">
          <thead>
            <tr><th>Question</th><th>Candidate Answer</th><th>Type</th><th>Max</th><th>Award</th></tr>
          </thead>
          <tbody>
            {detail.answers.map((a, idx) => {
              const q = a.questionId || {}
              const isMcq = (q.questionType || 'MCQ') === 'MCQ'
              return (
                <tr key={idx}>
                  <td>{q.question || '—'}</td>
                  <td>{isMcq ? `Option ${(a.selectedOption ?? -1) + 1}` : a.answerText || '—'}</td>
                  <td>{isMcq ? 'MCQ' : 'Descriptive'}</td>
                  <td>{q.marks ?? 1}</td>
                  <td>
                    {isMcq ? (
                      <span>{a.awarded ?? 0}</span>
                    ) : (
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max={q.marks ?? 1}
                        style={{ width: 90 }}
                        value={marks[q._id] ?? ''}
                        onChange={(e) => setMarks({ ...marks, [q._id]: e.target.value })}
                      />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {detail.status !== 'graded' ? (
        <form onSubmit={onSubmit} className="mt">
          <div className="field">
            <label>Verification Feedback</label>
            <input className="input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional comments recorded with the result" />
          </div>
          <button type="submit" className="btn btn-primary mt">Publish Verified Result</button>
        </form>
      ) : (
        <p className="muted mt-sm">This sheet has been graded. Manual marks: {detail.manualMarks}. Total: {detail.totalMarks}.</p>
      )}
    </div>
  )
}
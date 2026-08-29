import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { navigate } from '../router'
import { Loader, Alert, RequireAuth } from '../components/UI'

export default function TakeExam({ id }) {
  return (
    <RequireAuth>
      <TakeExamInner id={id} />
    </RequireAuth>
  )
}

function TakeExamInner({ id }) {
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const answersRef = useRef({})
  const submittedRef = useRef(false)
  const timerRef = useRef(null)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .get(`/exams/${id}/questions`)
      .then((res) => {
        setExam(res.data.exam)
        setQuestions(res.data.questions)
        setTimeLeft((res.data.exam.durationMinutes || 0) * 60)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const doSubmit = async (auto) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setBusy(true)
    setError('')
    const payload = Object.entries(answersRef.current)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([qid, v]) => ({ questionId: qid, selectedOption: Number(v) }))
    try {
      const res = await api.post(`/exams/${id}/submit`, { answers: payload })
      navigate(`/results/${res.data._id}`)
    } catch (e) {
      setError(e.message)
      submittedRef.current = false
      if (!auto) setBusy(false)
    } finally {
      if (auto) setBusy(false)
    }
  }

  useEffect(() => {
    if (timeLeft === null || submittedRef.current) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          doSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft])

  const select = (qid, index) => {
    setAnswers((a) => ({ ...a, [qid]: index }))
  }

  const submitManually = () => {
    doSubmit(false)
  }

  if (loading) return <Loader />
  if (!exam) {
    return (
      <div className="card empty">
        <Alert>{error}</Alert>
      </div>
    )
  }

  const mm = String(Math.floor((timeLeft || 0) / 60)).padStart(2, '0')
  const ss = String((timeLeft || 0) % 60).padStart(2, '0')
  const answered = Object.keys(answers).length

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="card">
        <div className="row-between">
          <div>
            <h2 className="heading">{exam.title}</h2>
            <p className="muted">{exam.organization}</p>
          </div>
          <div className="tag" style={{ fontSize: '1rem', fontWeight: 700 }}>
            {mm}:{ss}
          </div>
        </div>
        <p className="muted mt">
          {answered} of {questions.length} answered
        </p>
      </div>

      <Alert>{error}</Alert>

      {questions.map((q, qi) => (
        <div className="card mt" key={q._id}>
          <h3 style={{ fontSize: '1.05rem', margin: '0 0 12px' }}>
            Q{qi + 1}. {q.question}
          </h3>
          {q.options.map((opt, oi) => {
            const selected = answers[q._id] === oi
            return (
              <label className={`option-row ${selected ? 'selected' : ''}`} key={oi}>
                <input type="radio" name={q._id} checked={selected} onChange={() => select(q._id, oi)} />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      ))}

      <div className="mt">
        <button className="btn btn-primary" disabled={busy} onClick={submitManually}>
          {busy ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, RequireAuth } from '../components/UI'

export default function ResultDetail({ id }) {
  return (
    <RequireAuth>
      <ResultInner id={id} />
    </RequireAuth>
  )
}

function ResultInner({ id }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api
      .get(`/exams/results/${id}`)
      .then((res) => setResult(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!result) return <Alert>{error}</Alert>

  const exam = result.examId || {}
  const passed = result.status === 'Passed'

  return (
    <div style={{ maxWidth: 820 }}>
      <div className={`result-box ${passed ? 'result-pass' : 'result-fail'}`}>
        <h2>{result.status}</h2>
        <div className="big-score">{result.score} / {result.totalMarks}</div>
        <div>Percentage: {result.percentage}% &nbsp; Pass mark: {exam.passingMarks}</div>
      </div>

      <div className="card">
        <div className="row-between">
          <div>
            <h3 className="card-title">{exam.title}</h3>
            <p className="muted">{exam.organization}</p>
          </div>
          <Badge kind={passed ? 'ok' : 'bad'}>{result.status}</Badge>
        </div>
      </div>

      <h3 className="heading mt" style={{ fontSize: '1.1rem' }}>Answer Review</h3>
      {result.answers.map((a, i) => {
        const q = a.questionId || {}
        return (
          <div className="card mt" key={a._id || i}>
            <h4 style={{ margin: '0 0 10px' }}>Q{i + 1}. {q.question}</h4>
            {(q.options || []).map((opt, oi) => {
              let cls = ''
              if (a.selectedOption === oi && a.correct) cls = 'correct'
              else if (a.selectedOption === oi && !a.correct) cls = 'wrong'
              else if (a.correct && q._id) cls = 'correct'
              return (
                <div className={`option-row ${cls}`} key={oi}>
                  <span>{opt}</span>
                  {a.selectedOption === oi && <span style={{ marginLeft: 'auto' }} className="muted">Your answer</span>}
                </div>
              )
            })}
            <div className="muted mt">Marks: {a.correct ? `+${a.marks}` : '0'}</div>
          </div>
        )
      })}
    </div>
  )
}

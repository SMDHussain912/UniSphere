import { useEffect, useState } from 'react'
import { api } from '../api'
import { Loader, Alert, Badge, EmptyState, RequireAuth } from '../components/UI'

export default function Results() {
  return (
    <RequireAuth>
      <ResultsInner />
    </RequireAuth>
  )
}

function ResultsInner() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/exams/results')
      .then((res) => setResults(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div>
      <h2 className="heading">My Exam Results</h2>
      <p className="sub">Your past attempts and scores.</p>
      <Alert>{error}</Alert>
      {results.length === 0 && <EmptyState text="You have not taken any exams yet." />}
      {results.map((r) => {
        const exam = r.examId || {}
        return (
          <div className="card" key={r._id}>
            <div className="row-between">
              <h3 className="card-title">{exam.title || 'Exam'}</h3>
              <Badge kind={r.status === 'Passed' ? 'ok' : 'bad'}>{r.status}</Badge>
            </div>
            <p className="muted mt">
              Score: <strong>{r.score}</strong> / {r.totalMarks} ({r.percentage}%)
            </p>
            <div className="mt">
              <a href={`#/results/${r._id}`} className="btn btn-outline btn-sm">View Result</a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

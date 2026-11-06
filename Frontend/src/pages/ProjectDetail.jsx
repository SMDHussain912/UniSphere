import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import { Loader, Alert, Badge, formatDate, ProgressBar } from '../components/UI'

const badgeKind = (s) => ({ passed: 'ok', failed: 'error', reviewed: 'info', testing: 'warn', submitted: 'muted' }[s] || 'muted')
const levelKind = (d) => (d === 'beginner' ? 'ok' : d === 'advanced' ? 'warn' : 'info')

export default function ProjectDetail({ slug }) {
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState([])
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api
      .get(`/projects/${slug}`)
      .then(async (res) => {
        setProject(res.data)
        setCode(res.data.starterCode || '')
        if (user) {
          const mine = await api.get('/projects/submissions/mine')
          setSubmissions((mine.data || []).filter((s) => s.projectId?.slug === slug))
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [slug, user])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setNotice('')
    try {
      const res = await api.post(`/projects/${project._id}/submit`, { repoUrl, demoUrl, code })
      setSubmissions([res.data, ...submissions])
      setNotice('Project submitted. Run the tests to get scored.')
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  const runTests = async (id) => {
    setBusy(true)
    setNotice('')
    try {
      const res = await api.post(`/projects/submissions/${id}/test`, {})
      setSubmissions(submissions.map((s) => (s._id === id ? res.data : s)))
      setNotice('Tests completed.')
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Loader />
  if (error) return <Alert>{error}</Alert>
  if (!project) return <Alert>Project not found.</Alert>

  return (
    <div>
      <h2 className="heading">{project.title}</h2>
      <div className="meta">
        <Badge kind={levelKind(project.difficulty)}>{project.difficulty}</Badge>
        <span className="tag">{project.totalPoints} points</span>
        <span className="tag">~{project.estimatedHours}h</span>
      </div>
      <p className="sub mt">{project.description}</p>
      <div className="meta">
        {(project.skillKeys || []).map((s) => (
          <span className="tag" key={s}>{s}</span>
        ))}
      </div>
      <ProjectWorkspace
        project={project}
        user={user}
        submissions={submissions}
        busy={busy}
        notice={notice}
        form={{ repoUrl, demoUrl, code, setRepoUrl, setDemoUrl, setCode }}
        runTests={runTests}
        submit={submit}
      />
    </div>
  )
}

function ProjectWorkspace({ project, user, submissions, busy, notice, form, runTests, submit }) {
  return (
    <>
      <div className="grid mt">
        <div className="card">
          <h3 className="card-title">Test Criteria</h3>
          {(project.testCriteria || []).map((t) => (
            <div className="row-between" key={t.name}>
              <span>{t.name}</span>
              <Badge kind="muted">{t.points} pts</Badge>
            </div>
          ))}
          <p className="muted mt">Pass threshold: 60% of total points earns verified skill evidence.</p>
        </div>
        <div className="card">
          <h3 className="card-title">Submit Your Work</h3>
          {user ? (
            <form onSubmit={submit}>
              <input className="input" placeholder="Repository URL (optional)" value={form.repoUrl} onChange={(e) => form.setRepoUrl(e.target.value)} />
              <input className="input mt" placeholder="Demo URL (optional)" value={form.demoUrl} onChange={(e) => form.setDemoUrl(e.target.value)} />
              <textarea className="code-editor mt" rows={8} value={form.code} onChange={(e) => form.setCode(e.target.value)} spellCheck="false" />
              <button className="btn btn-primary mt" disabled={busy}>{busy ? 'Working...' : 'Submit Project'}</button>
            </form>
          ) : (
            <p className="muted">Log in to submit this project.</p>
          )}
        </div>
      </div>
      {notice && <Alert kind="info">{notice}</Alert>}
      <h3 className="heading mt">My Submissions</h3>
      {submissions.length === 0 ? (
        <p className="muted">No submissions yet.</p>
      ) : (
        submissions.map((s) => (
          <div className="card mt" key={s._id}>
            <div className="row-between">
              <div>
                <strong>{formatDate(s.submittedAt)}</strong>
                <div className="muted">Score {s.score}/{s.maxScore}</div>
              </div>
              <div>
                <Badge kind={badgeKind(s.status)}>{s.status}</Badge>
                {s.status === 'submitted' && (
                  <button type="button" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} disabled={busy} onClick={() => runTests(s._id)}>
                    Run Tests
                  </button>
                )}
              </div>
            </div>
            {s.status === 'testing' && <Loader />}
            {(s.testResults || []).length > 0 && (
              <div className="mt">
                {s.testResults.map((t) => (
                  <div className="row-between" key={t.name}>
                    <span>{t.name}</span>
                    <Badge kind={t.passed ? 'ok' : 'error'}>{t.passed ? `+${t.points}` : 'failed'}</Badge>
                  </div>
                ))}
                <ProgressBar value={(s.score / (s.maxScore || 1)) * 100} />
              </div>
            )}
            {(s.reviews || []).map((r, i) => (
              <p className="muted mt" key={i}>Review {r.rating}/5 {r.feedback ? `— ${r.feedback}` : ''}</p>
            ))}
          </div>
        ))
      )}
    </>
  )
}


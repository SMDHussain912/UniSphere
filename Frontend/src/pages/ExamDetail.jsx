import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import { navigate } from '../router'
import { Loader, Alert, Badge, formatDate } from '../components/UI'

export default function ExamDetail({ id }) {
  const { user } = useAuth()
  const [exam, setExam] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .get(`/exams/${id}`)
      .then((res) => setExam(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || user.role !== 'user') return
    api
      .get('/enrollments')
      .then((res) => {
        const mine = (res.data || []).find((en) => en.examId && (en.examId._id || en.examId) === id)
        if (mine) {
          setEnrollment(mine)
          setEnrolled(true)
        }
      })
      .catch(() => {})
  }, [id, user])

  const enroll = async () => {
    setActionError('')
    setEnrolling(true)
    try {
      const res = await api.post(`/exams/${id}/enroll`, { formData: {} })
      setEnrollment(res.data)
      setEnrolled(true)
    } catch (e) {
      setActionError(e.message)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <Loader />
  if (!exam) return <Alert>{error}</Alert>

  const statusKind = exam.status === 'Active' ? 'ok' : exam.status === 'Inactive' ? 'warn' : 'bad'
  const isCandidate = user && user.role === 'user'
  const isStaff = user && user.role !== 'user'
  const canStart = isStaff || (enrollment && enrollment.status === 'confirmed')

  return (
    <div style={{ maxWidth: 820 }}>
      <div className="card">
        <div className="row-between">
          <div>
            <h2 className="heading">{exam.title}</h2>
            <p className="muted">{exam.organization}</p>
          </div>
          <Badge kind={statusKind}>{exam.status}</Badge>
        </div>
        <p className="mt">{exam.description}</p>
        <div className="meta">
          <span className="tag">{exam.category}</span>
          <span className="tag">{exam.qualification}</span>
          <span className="tag">{exam.durationMinutes} min</span>
        </div>
      </div>

      <div className="card mt">
        <div className="detail-grid">
          <span className="k">Total Marks</span><span>{exam.totalMarks}</span>
          <span className="k">Passing Marks</span><span>{exam.passingMarks}</span>
          <span className="k">Vacancies</span><span>{exam.vacancies || 0}</span>
          <span className="k">Application Fee</span><span>{exam.applicationFee ? `₹${exam.applicationFee}` : 'Free'}</span>
          <span className="k">Exam Date</span><span>{formatDate(exam.examDate)}</span>
          <span className="k">Last Date to Apply</span><span>{formatDate(exam.lastDate)}</span>
        </div>
      </div>

      {(exam.syllabus || exam.examPattern) && (
        <div className="card mt">
          <h3 className="card-title">Exam Pattern & Syllabus</h3>
          {exam.examPattern && <p className="mt muted"><strong>Pattern:</strong> {exam.examPattern}</p>}
          {exam.syllabus && <p className="mt muted"><strong>Syllabus:</strong> {exam.syllabus}</p>}
        </div>
      )}

      <div className="mt">
        <Alert>{actionError}</Alert>
        {!user && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
            Login to Enroll
          </button>
        )}
        {isCandidate && !enrolled && (
          <button type="button" className="btn btn-primary" disabled={enrolling} onClick={enroll}>
            {enrolling ? 'Enrolling...' : 'Enroll for this Exam'}
          </button>
        )}
        {isCandidate && enrolled && (
          <div className="card mt">
            <div className="row-between">
              <div>
                <strong>Registration No: {enrollment.registrationNumber}</strong>
                <div className="muted mt-sm">
                  Status: <Badge kind={enrollment.status === 'confirmed' ? 'ok' : enrollment.status === 'rejected' ? 'bad' : 'warn'}>{enrollment.status}</Badge>
                </div>
              </div>
              <div>
                {canStart && (
                  <a href={`#/exams/${exam._id}/take`} className="btn btn-primary">Start Exam</a>
                )}
                <a href="#/enrollments" className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }}>My Enrollments</a>
              </div>
            </div>
            {enrollment.status === 'applied' && (
              <p className="muted mt-sm">Your enrollment is awaiting confirmation by the UniSphere exam office. Once confirmed, your hall ticket will be issued automatically.</p>
            )}
            {enrollment.status === 'rejected' && (
              <p className="muted mt-sm">{enrollment.adminMessage || 'Your enrollment was rejected. Contact the exam office for details.'}</p>
            )}
          </div>
        )}
        {isStaff && (
          <a href={`#/exams/${exam._id}/take`} className="btn btn-primary">Start Exam</a>
        )}
        {!user && <p className="muted mt-sm">Create a candidate account to enroll. Enrollment confirmation and hall ticket issuance are handled by the UniSphere exam office.</p>}
      </div>
    </div>
  )
}

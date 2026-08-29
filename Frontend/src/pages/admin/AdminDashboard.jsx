import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, RequireRole, ROLE_LABELS } from '../../components/UI'
import { useAuth } from '../../auth/AuthContext'

export default function AdminDashboard() {
  return (
    <RequireRole roles={['admin', 'superadmin', 'exam_admin', 'question_admin', 'hallticket_admin', 'grader_admin']}>
      <DashboardInner />
    </RequireRole>
  )
}

const ALL_CARDS = [
  { label: 'Candidates', value: (s) => s.totalUsers, to: '/admin', roles: ['admin', 'superadmin'] },
  { label: 'Jobs', value: (s) => s.totalJobs, to: '/admin/jobs', roles: ['admin', 'superadmin'] },
  { label: 'Applications', value: (s) => s.totalApplications, to: '/admin/applications', roles: ['admin', 'superadmin'] },
  { label: 'Pending Apps', value: (s) => s.pendingApplications, to: '/admin/applications', roles: ['admin', 'superadmin'] },
  { label: 'Exams', value: (s) => s.totalExams, to: '/admin/exams', roles: ['admin', 'superadmin', 'exam_admin'] },
  { label: 'Enrollments', value: (s) => s.totalEnrollments, to: '/admin/enrollments', roles: ['admin', 'superadmin', 'exam_admin', 'hallticket_admin'] },
  { label: 'Confirmed', value: (s) => s.confirmedEnrollments, to: '/admin/enrollments', roles: ['admin', 'superadmin', 'exam_admin', 'hallticket_admin'] },
  { label: 'Hall Tickets', value: (s) => s.hallTicketsIssued, to: '/admin/hall-tickets', roles: ['admin', 'superadmin', 'hallticket_admin'] },
  { label: 'Papers', value: (s) => s.totalPapers, to: '/admin/papers', roles: ['admin', 'superadmin', 'question_admin'] },
  { label: 'Sheets to Verify', value: (s) => s.pendingAnswerSheets, to: '/admin/grading', roles: ['admin', 'superadmin', 'grader_admin'] },
  { label: 'Attempts', value: (s) => s.totalExamAttempts, to: '/admin/results', roles: ['admin', 'superadmin', 'grader_admin'] },
  { label: 'Passed', value: (s) => s.passedExams, to: '/admin/results', roles: ['admin', 'superadmin', 'grader_admin'] },
]

const ALL_LINKS = [
  { label: 'Overview', to: '/admin', roles: ['admin', 'superadmin'] },
  { label: 'Manage Exams', to: '/admin/exams', roles: ['admin', 'superadmin', 'exam_admin'] },
  { label: 'Exam Centers', to: '/admin/centers', roles: ['admin', 'superadmin', 'exam_admin', 'hallticket_admin'] },
  { label: 'Enrollments', to: '/admin/enrollments', roles: ['admin', 'superadmin', 'exam_admin'] },
  { label: 'Hall Tickets', to: '/admin/hall-tickets', roles: ['admin', 'superadmin', 'hallticket_admin'] },
  { label: 'Question Papers', to: '/admin/papers', roles: ['admin', 'superadmin', 'question_admin'] },
  { label: 'Answer Verification', to: '/admin/grading', roles: ['admin', 'superadmin', 'grader_admin'] },
  { label: 'Exam Results', to: '/admin/results', roles: ['admin', 'superadmin', 'grader_admin'] },
  { label: 'Job Applications', to: '/admin/applications', roles: ['admin', 'superadmin'] },
  { label: 'Manage Jobs', to: '/admin/jobs', roles: ['admin', 'superadmin'] },
  { label: 'News', to: '/admin/news', roles: ['admin', 'superadmin'] },
  { label: 'Admin Accounts', to: '/admin/admins', roles: ['superadmin'] },
]

function DashboardInner() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (!stats) return <Alert>{error}</Alert>

  const role = user?.role
  const cards = ALL_CARDS.filter((c) => c.roles.includes(role) && c.value(stats) !== undefined)
  const links = ALL_LINKS.filter((l) => l.roles.includes(role))

  return (
    <div>
      <h2 className="heading">{ROLE_LABELS[role] || 'Admin'} Workspace</h2>
      <p className="sub">Overview of UniSphere activity for your role.</p>
      <Alert>{error}</Alert>
      {cards.length > 0 && (
        <div className="stats-grid mb">
          {cards.map((c) => (
            <a key={c.label} href={`#${c.to}`} className="stat">
              <div className="stat-value">{c.value(stats)}</div>
              <div className="stat-label">{c.label}</div>
            </a>
          ))}
        </div>
      )}
      <div className="admin-grid">
        {links.map((l) => (
          <a key={l.to} href={`#${l.to}`} className="sidebar-link">{l.label}</a>
        ))}
      </div>
    </div>
  )
}

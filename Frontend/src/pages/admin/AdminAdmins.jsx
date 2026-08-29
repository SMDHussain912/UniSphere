import { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import { Loader, Alert, Badge, EmptyState, AdminTabs, formatDate, RequireRole, ROLE_LABELS } from '../../components/UI'

export default function AdminAdmins() {
  return (
    <RequireRole roles={['superadmin']}>
      <Section />
    </RequireRole>
  )
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator (full access except admin accounts)' },
  { value: 'exam_admin', label: 'Exam Officer (enrollments, centers, exams)' },
  { value: 'question_admin', label: 'Question Setter (questions, papers, answer keys)' },
  { value: 'hallticket_admin', label: 'Hall Ticket Officer (hall tickets, centers)' },
  { value: 'grader_admin', label: 'Answer Evaluator (verification and marks)' },
]

function Section() {
  const { user: me } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', dob: '', gender: 'Male',
    qualification: 'Degree', password: '', role: 'exam_admin',
  })

  const load = () => {
    setLoading(true)
    api
      .get('/admin/admins')
      .then((res) => setItems(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const toggleStatus = async (account) => {
    setError('')
    setNotice('')
    try {
      const res = await api.post(`/admin/admins/${account._id}/status`, { active: !account.active })
      setNotice(res.message || 'Account status updated.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const resetPassword = async (account) => {
    const next = window.prompt(`Enter a new password for ${account.email}`)
    if (!next) return
    setError('')
    setNotice('')
    try {
      await api.post(`/admin/admins/${account._id}/reset-password`, { password: next })
      setNotice('Password reset successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.post('/admin/admins', form)
      setNotice('Admin account created successfully.')
      setForm({ firstname: '', lastname: '', email: '', phone: '', dob: '', gender: 'Male', qualification: 'Degree', password: '', role: 'exam_admin' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Admin Accounts</h2>
      <p className="sub">Create and review staff accounts. Only the super admin can manage admin accounts.</p>
      <AdminTabs current="admins" />
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>

      <div className="card">
        <h3 className="card-title">Create Admin Account</h3>
        <form onSubmit={submit} className="form-grid">
          <input className="input" placeholder="First name" value={form.firstname} onChange={change('firstname')} required />
          <input className="input" placeholder="Last name" value={form.lastname} onChange={change('lastname')} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={change('email')} required />
          <input className="input" placeholder="Phone (10 digits)" value={form.phone} onChange={change('phone')} required />
          <input className="input" type="date" value={form.dob} onChange={change('dob')} required />
          <select className="select" value={form.gender} onChange={change('gender')}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select className="select" value={form.qualification} onChange={change('qualification')}>
            <option value="10th Pass">10th Pass</option>
            <option value="12th Pass">12th Pass</option>
            <option value="Diploma">Diploma</option>
            <option value="Degree">Degree</option>
            <option value="B.Tech">B.Tech</option>
          </select>
          <select className="select" value={form.role} onChange={change('role')}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input className="input" type="password" placeholder="Temporary password" value={form.password} onChange={change('password')} required />
          <div><button type="submit" className="btn btn-primary">Create Account</button></div>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No admin accounts found." />
      ) : (
        <div className="table-wrap mt">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id}>
                  <td><strong>{a.fullname?.firstname} {a.fullname?.lastname}</strong></td>
                  <td>{a.email}</td>
                  <td>{a.phone}</td>
                  <td><Badge kind={a.role === 'superadmin' ? 'bad' : 'info'}>{ROLE_LABELS[a.role] || a.role}</Badge></td>
                  <td><Badge kind={a.active === false ? 'muted' : 'ok'}>{a.active === false ? 'Inactive' : 'Active'}</Badge></td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    {a._id !== me?._id && (
                      <>
                        <button
                          className={a.active === false ? 'btn btn-primary btn-sm' : 'btn btn-danger btn-sm'}
                          style={{ marginRight: 6 }}
                          onClick={() => toggleStatus(a)}
                        >
                          {a.active === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => resetPassword(a)}>
                          Reset Password
                        </button>
                      </>
                    )}
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
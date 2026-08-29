import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../auth/AuthContext'
import { RequireAuth, Field, Alert } from '../components/UI'

export default function Profile() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  )
}

function ProfileInner() {
  const { user, setUser } = useAuth()
  const base = user.fullname || { firstname: '', lastname: '' }
  const [form, setForm] = useState({
    firstname: base.firstname || '',
    lastname: base.lastname || '',
    phone: user.phone || '',
    gender: user.gender || 'Male',
    qualification: user.qualification || 'Degree',
  })
  const [pass, setPass] = useState({ currentPassword: '', newPassword: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [pmsg, setPmsg] = useState('')
  const [perr, setPerr] = useState('')

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setP = (k) => (e) => setPass((f) => ({ ...f, [k]: e.target.value }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      const res = await api.put('/auth/profile', form)
      setUser(res.data.user)
      setMsg('Profile updated successfully')
    } catch (err) {
      setError(err.message)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPerr('')
    setPmsg('')
    try {
      await api.post('/auth/change-password', pass)
      setPass({ currentPassword: '', newPassword: '' })
      setPmsg('Password changed successfully')
    } catch (err) {
      setPerr(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <h2 className="heading">My Profile</h2>
      <p className="sub">{user.email}</p>

      <div className="card mt">
        <h3 className="card-title">Personal Details</h3>
        <Alert kind="ok">{msg}</Alert>
        <Alert>{error}</Alert>
        <form className="form mt" onSubmit={saveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First Name">
              <input className="input" value={form.firstname} onChange={setF('firstname')} />
            </Field>
            <Field label="Last Name">
              <input className="input" value={form.lastname} onChange={setF('lastname')} />
            </Field>
          </div>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={setF('phone')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Gender">
              <select className="select" value={form.gender} onChange={setF('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Qualification">
              <select className="select" value={form.qualification} onChange={setF('qualification')}>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma</option>
                <option value="Degree">Degree</option>
                <option value="B.Tech">B.Tech</option>
              </select>
            </Field>
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="card mt">
        <h3 className="card-title">Change Password</h3>
        <Alert kind="ok">{pmsg}</Alert>
        <Alert>{perr}</Alert>
        <form className="form mt" onSubmit={savePassword}>
          <Field label="Current Password">
            <input className="input" type="password" required value={pass.currentPassword} onChange={setP('currentPassword')} />
          </Field>
          <Field label="New Password">
            <input className="input" type="password" required value={pass.newPassword} onChange={setP('newPassword')} />
          </Field>
          <button className="btn btn-outline">Update Password</button>
        </form>
      </div>
    </div>
  )
}

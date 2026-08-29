import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { navigate } from '../router'
import { CaptchaField, Field, Alert } from '../components/UI'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', phone: '', dob: '',
    gender: 'Male', qualification: 'Degree', password: '', captcha: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setForm((f) => ({ ...f, captcha: '' }))
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 className="heading">Create Account</h2>
        <p className="muted">Register to start applying for exams and jobs at UniSphere.</p>
        <Alert>{error}</Alert>
        <form className="form mt" onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First Name">
              <input className="input" required value={form.firstname} onChange={set('firstname')} />
            </Field>
            <Field label="Last Name">
              <input className="input" required value={form.lastname} onChange={set('lastname')} />
            </Field>
          </div>
          <Field label="Email">
            <input className="input" type="email" required value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone">
            <input className="input" required value={form.phone} onChange={set('phone')} />
          </Field>
          <Field label="Date of Birth">
            <input className="input" type="date" required value={form.dob} onChange={set('dob')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Gender">
              <select className="select" value={form.gender} onChange={set('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Qualification">
              <select className="select" value={form.qualification} onChange={set('qualification')}>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma</option>
                <option value="Degree">Degree</option>
                <option value="B.Tech">B.Tech</option>
              </select>
            </Field>
          </div>
          <Field label="Password">
            <input className="input" type="password" required value={form.password} onChange={set('password')} />
          </Field>
          <Field label="Captcha">
            <CaptchaField value={form.captcha} onChange={(v) => setForm((f) => ({ ...f, captcha: v }))} />
          </Field>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="muted mt">
          Already have an account? <a className="link" href="#/login">Log in</a>
        </p>
      </div>
    </div>
  )
}

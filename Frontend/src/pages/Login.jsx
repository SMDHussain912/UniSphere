import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { navigate } from '../router'
import { CaptchaField, Field, Alert } from '../components/UI'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password, captcha)
      navigate('/')
    } catch (err) {
      setCaptcha('')
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h2 className="heading">Welcome Back</h2>
        <p className="muted">Log in to take exams and manage your applications.</p>
        <Alert>{error}</Alert>
        <form className="form mt" onSubmit={submit}>
          <Field label="Email">
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Captcha">
            <CaptchaField value={captcha} onChange={setCaptcha} />
          </Field>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="muted mt">
          New here? <a className="link" href="#/register">Create an account</a>
        </p>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api, request } from '../api'
import { navigate } from '../router'
import { Loader, Alert, Field, RequireAuth } from '../components/UI'

export default function ApplyJob({ id }) {
  return (
    <RequireAuth>
      <ApplyInner id={id} />
    </RequireAuth>
  )
}

const CATEGORIES = ['OC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST', 'EWS']
const PARENT_STATUSES = ['both', 'father', 'mother', 'orphan']
const DOC_FIELDS = ['identityProof', 'sscMarksMemo', 'recentExaminationMarksMemo', 'incomeCertificate', 'casteCertificate', 'passportPhoto', 'signature', 'resume']

function ApplyInner({ id }) {
  const [job, setJob] = useState(null)
  const [form, setForm] = useState({
    fullname: '', adhaar: '', mobileno: '', gender: 'male', parentstatus: 'both',
    fathername: '', mothername: '', email: '', category: 'OC', annualincome: '',
    identificationmark1: '', identificationmark2: '', fulladdress: '',
    sscBoard: '', sscPercentage: '', studyType: 'degree', university: '', higherPercentage: '',
  })
  const [files, setFiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!job) return <Alert>{error}</Alert>

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setFile = (k) => (e) => setFiles((f) => ({ ...f, [k]: e.target.files[0] }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const fd = new FormData()
      const direct = ['fullname', 'adhaar', 'mobileno', 'gender', 'parentstatus', 'fathername', 'mothername', 'email', 'category', 'annualincome', 'identificationmark1', 'identificationmark2', 'fulladdress']
      direct.forEach((k) => {
        if (form[k] !== '' && form[k] != null) fd.append(k, form[k])
      })
      const education = {
        ssc: { board: form.sscBoard, percentage: form.sscPercentage ? Number(form.sscPercentage) : null },
        higherStudies: { stype: form.studyType, universityname: form.university, percentage: form.higherPercentage || null },
      }
      fd.append('jobId', id)
      fd.append('education', JSON.stringify(education))
      DOC_FIELDS.forEach((field) => {
        if (files[field]) fd.append(field, files[field])
      })
      await request('/applications', { method: 'POST', body: fd })
      navigate('/applications')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <h2 className="heading">Apply — {job.title}</h2>
      <p className="sub">{job.organization}</p>
      <Alert>{error}</Alert>
      <form className="form mt" onSubmit={submit} encType="multipart/form-data">
        <div className="card">
          <h3 className="card-title">Personal Details</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <Field label="Full Name"><input className="input" required value={form.fullname} onChange={setF('fullname')} /></Field>
            <Field label="Aadhaar Number"><input className="input" required pattern="[0-9]{12}" title="12 digits" value={form.adhaar} onChange={setF('adhaar')} /></Field>
            <Field label="Mobile Number"><input className="input" required pattern="[0-9]{10}" title="10 digits" value={form.mobileno} onChange={setF('mobileno')} /></Field>
            <Field label="Email"><input className="input" type="email" required value={form.email} onChange={setF('email')} /></Field>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Category & Guardians</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <Field label="Gender">
              <select className="select" value={form.gender} onChange={setF('gender')}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Category">
              <select className="select" value={form.category} onChange={setF('category')}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Parent Status">
              <select className="select" value={form.parentstatus} onChange={setF('parentstatus')}>
                {PARENT_STATUSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Father Name"><input className="input" value={form.fathername} onChange={setF('fathername')} /></Field>
            <Field label="Mother Name"><input className="input" value={form.mothername} onChange={setF('mothername')} /></Field>
            <Field label="Annual Income"><input className="input" type="number" value={form.annualincome} onChange={setF('annualincome')} /></Field>
          </div>
          <div className="mt">
            <Field label="Full Address">
              <textarea className="input" required value={form.fulladdress} onChange={setF('fulladdress')} />
            </Field>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Education</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <Field label="SSC Board"><input className="input" value={form.sscBoard} onChange={setF('sscBoard')} /></Field>
            <Field label="SSC Percentage"><input className="input" type="number" value={form.sscPercentage} onChange={setF('sscPercentage')} /></Field>
            <Field label="Higher Study Type">
              <select className="select" value={form.studyType} onChange={setF('studyType')}>
                <option value="degree">Degree</option>
                <option value="btech">B.Tech</option>
                <option value="mtech">M.Tech</option>
                <option value="other">Other</option>
                <option value="none">None</option>
              </select>
            </Field>
            <Field label="University"><input className="input" value={form.university} onChange={setF('university')} /></Field>
            <Field label="Higher Percentage"><input className="input" type="number" value={form.higherPercentage} onChange={setF('higherPercentage')} /></Field>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Documents</h3>
          <div className="grid" style={{ marginTop: 14 }}>
            <Field label="Identity Proof"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('identityProof')} /></Field>
            <Field label="SSC Marks Memo"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('sscMarksMemo')} /></Field>
            <Field label="Examination Marks Memo"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('recentExaminationMarksMemo')} /></Field>
            <Field label="Income Certificate"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('incomeCertificate')} /></Field>
            <Field label="Caste Certificate"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('casteCertificate')} /></Field>
            <Field label="Passport Photo"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('passportPhoto')} /></Field>
            <Field label="Signature"><input className="input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={setFile('signature')} /></Field>
            <Field label="Resume"><input className="input" type="file" accept=".pdf,.doc,.docx" onChange={setFile('resume')} /></Field>
          </div>
        </div>

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}

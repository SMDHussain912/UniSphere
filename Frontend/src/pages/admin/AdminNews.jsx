import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, EmptyState, Field, Badge, AdminTabs, formatDate } from '../../components/UI'
import { RequireAdmin } from '../../components/UI'

export default function AdminNews() {
  return (
    <RequireAdmin>
      <Section />
    </RequireAdmin>
  )
}

const EMPTY = { title: '', category: '', description: '' }

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  const load = () => {
    api
      .get('/news')
      .then((res) => setItems(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/news', form)
      setForm(EMPTY)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (nid) => {
    if (!window.confirm('Delete this news item?')) return
    try {
      await api.del(`/news/${nid}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Manage News</h2>
      <p className="sub">Publish news and notifications.</p>
      <AdminTabs current="news" />
      <Alert>{error}</Alert>

      <form className="card form mb" onSubmit={create}>
        <h3 className="card-title">New News</h3>
        <div className="grid">
          <Field label="Title"><input className="input" required value={form.title} onChange={setF('title')} /></Field>
          <Field label="Category"><input className="input" required value={form.category} onChange={setF('category')} /></Field>
        </div>
        <Field label="Description"><textarea className="input" required value={form.description} onChange={setF('description')} /></Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Publishing...' : 'Publish'}</button>
      </form>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No news published yet." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n._id}>
                  <td>{n.title}</td>
                  <td><Badge kind="info">{n.category}</Badge></td>
                  <td>{formatDate(n.date)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => remove(n._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

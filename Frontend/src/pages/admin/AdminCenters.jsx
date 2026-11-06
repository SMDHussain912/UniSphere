import { useEffect, useState } from 'react'
import { api } from '../../api'
import { Loader, Alert, Badge, EmptyState, AdminTabs, RequireRole } from '../../components/UI'

export default function AdminCenters() {
  return (
    <RequireRole roles={['admin', 'superadmin', 'exam_admin', 'hallticket_admin']}>
      <Section />
    </RequireRole>
  )
}

function Section() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', code: '', address: '', city: '', capacity: '' })
  const [editingId, setEditingId] = useState('')

  const load = () => {
    api
      .get('/admin/exam-centers')
      .then((res) => setItems(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      const body = { ...form, capacity: form.capacity ? Number(form.capacity) : undefined }
      if (editingId) {
        await api.put(`/admin/exam-centers/${editingId}`, body)
        setNotice('Center updated successfully.')
      } else {
        await api.post('/admin/exam-centers', body)
        setNotice('Center created successfully.')
      }
      setForm({ name: '', code: '', address: '', city: '', capacity: '' })
      setEditingId('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const edit = (c) => {
    setEditingId(c._id)
    setForm({ name: c.name, code: c.code, address: c.address, city: c.city, capacity: c.capacity || '' })
    window.scrollTo(0, 0)
  }

  const remove = async (id) => {
    setError('')
    try {
      await api.del(`/admin/exam-centers/${id}`)
      setNotice('Center deleted.')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2 className="heading">Exam Centers</h2>
      <p className="sub">Manage examination venues and their capacity.</p>
      <AdminTabs current="centers" />
      <Alert>{error}</Alert>
      <Alert kind="ok">{notice}</Alert>

      <div className="card">
        <h3 className="card-title">{editingId ? 'Edit Center' : 'Add New Center'}</h3>
        <form onSubmit={submit} className="form-grid">
          <input className="input" placeholder="Center name" value={form.name} onChange={change('name')} required />
          <input className="input" placeholder="Center code" value={form.code} onChange={change('code')} required />
          <input className="input" placeholder="City" value={form.city} onChange={change('city')} required />
          <input className="input" type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={change('capacity')} />
          <input className="input" placeholder="Full address" value={form.address} onChange={change('address')} required />
          <div>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update Center' : 'Create Center'}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={() => { setEditingId(''); setForm({ name: '', code: '', address: '', city: '', capacity: '' }) }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState text="No exam centers yet." />
      ) : (
        <div className="table-wrap mt">
          <table className="table">
            <thead>
              <tr><th>Code</th><th>Name</th><th>City</th><th>Capacity</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.name}<div className="muted">{c.address}</div></td>
                  <td>{c.city}</td>
                  <td>{c.capacity || '—'}</td>
                  <td><Badge kind={c.status === 'Active' ? 'ok' : 'muted'}>{c.status || 'Active'}</Badge></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => edit(c)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c._id)}>Delete</button>
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
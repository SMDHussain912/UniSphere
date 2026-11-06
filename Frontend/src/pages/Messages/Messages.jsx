import { useEffect, useState } from 'react'
import { useHashLocation } from '../../router'
import { api } from '../../api'
import { Loader, EmptyState, Avatar } from '../../components/UI'

export default function Messages() {
  const location = useHashLocation()
  const segs = location.split('/').filter(Boolean)
  const id = segs[1]
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    if (!id) {
      api
        .get('/chat/conversations')
        .then((res) => setConversations(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false))
      return
    }
    api
      .get(`/chat/conversations/${id}/messages`)
      .then((res) => setMessages(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleSend = (e) => {
    e.preventDefault()
    setSending(true)
    api
      .post(`/chat/conversations/${id}/messages`, { content: text })
      .then(() => {
        setText('')
        api
          .get(`/chat/conversations/${id}/messages`)
          .then((res) => setMessages(res.data || []))
          .catch(() => {})
      })
      .catch(() => {})
      .finally(() => setSending(false))
  }

  if (loading) return <Loader />

  if (!id) {
    return (
      <div className="container">
        <h2 className="heading">Messages</h2>
        {conversations.length === 0 ? (
          <EmptyState text="No conversations yet." />
        ) : (
          <div className="list">
            {conversations.map((c) => (
              <a key={c._id} href={`#/messages/${c._id}`} className="list-item">
                <Avatar src={c.participant?.avatar} name={c.participant?.fullname?.firstname} />
                <div>
                  <strong>
                    {c.participant?.fullname
                      ? `${c.participant.fullname.firstname} ${c.participant.fullname.lastname}`
                      : '—'}
                  </strong>
                  <div className="muted small">{c.lastMessage || ''}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="chat-layout">
      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m._id} className={`msg ${m.fromMe ? 'own' : ''}`}>
              <div className="msg-content">{m.content}</div>
              <div className="muted small">{formatTime(m.createdAt)}</div>
            </div>
          ))}
        </div>
        <form className="chat-input" onSubmit={handleSend}>
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !text}>
            Send
          </button>
        </form>
      </main>
    </div>
  )
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const API = '/api/v1'

function getToken() {
  return localStorage.getItem('unisphere_token') || ''
}

export async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let body = options.body
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  const res = await fetch(`${API}${path}`, {
    method: options.method || 'GET',
    headers,
    body,
  })

  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

export async function getRaw(path) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { headers })
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`)
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, file, field = 'file') => {
    const data = new FormData()
    data.append(field, file)
    return request(path, { method: 'POST', body: data })
  },
}

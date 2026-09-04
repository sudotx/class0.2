const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const token = localStorage.getItem('token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body && !isFormData) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `request failed (${res.status})`)
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

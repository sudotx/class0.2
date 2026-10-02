import { api, BASE_URL } from './client'

export const register = (data) => api.post('/auth/register', data)
// Login sends HTTP Basic Auth, matching the backend (Postman: Auth tab -> Basic Auth).
export const login = ({ username, password }) =>
  api.post('/auth/login', undefined, {
    headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
  })

export const googleLoginUrl = `${BASE_URL}/auth/google`

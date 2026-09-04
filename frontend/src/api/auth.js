import { api, BASE_URL } from './client'

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

export const googleLoginUrl = `${BASE_URL}/auth/google`

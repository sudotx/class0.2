import { api, BASE_URL } from './client'

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const createApiKey = (data) => api.post('/auth/api-keys', data)

export const googleLoginUrl = `${BASE_URL}/auth/google`

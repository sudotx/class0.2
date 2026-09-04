import { api } from './client'

export const getMe = () => api.get('/users/me')
export const updateMe = (data) => api.patch('/users/me', data)
export const updatePassword = (data) => api.patch('/users/me/password', data)
export const deleteMe = () => api.delete('/users/me')

export const uploadAvatar = (file) => {
  const form = new FormData()
  form.append('avatar', file)
  return api.post('/users/me/avatar', form, { isFormData: true })
}

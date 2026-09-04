import { api } from './client'

export const listProducts = (params = '') => api.get(`/products${params}`)
export const getProduct = (id) => api.get(`/products/${id}`)

export const createProduct = (formData) =>
  api.post('/products', formData, { isFormData: true })

export const updateProduct = (id, formData) =>
  api.patch(`/products/${id}`, formData, { isFormData: true })

export const deleteProduct = (id) => api.delete(`/products/${id}`)

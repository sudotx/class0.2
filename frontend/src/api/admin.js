import { api } from './client'

export const listAllUsers = () => api.get('/admin/users')
export const listAllOrders = () => api.get('/admin/orders')

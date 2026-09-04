import { api } from './client'

export const listOrders = () => api.get('/orders')
export const getOrder = (id) => api.get(`/orders/${id}`)

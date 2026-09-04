import { api } from './client'

export const getCart = () => api.get('/cart')
export const addItem = (productId, quantity) => api.post('/cart/items', { productId, quantity })
export const updateItem = (productId, quantity) => api.patch(`/cart/items/${productId}`, { quantity })
export const removeItem = (productId) => api.delete(`/cart/items/${productId}`)
export const clearCart = () => api.delete('/cart')

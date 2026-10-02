import { api } from './client'

export const initializeCheckout = () => api.post('/checkout/initialize')

export const verifyCheckout = (reference) => api.get(`/checkout/verify/${reference}`)

import { api } from './client'

export const initializeCheckout = (shippingAddress) =>
  api.post('/checkout/initialize', { shippingAddress })

export const verifyCheckout = (reference) => api.get(`/checkout/verify/${reference}`)

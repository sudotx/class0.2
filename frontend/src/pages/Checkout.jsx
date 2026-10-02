import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as checkoutApi from '../api/checkout'
import * as cartApi from '../api/cart'

export default function Checkout() {
  const [cart, setCart] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    cartApi.getCart().then(setCart).catch((err) => setError(err.message))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { authorizationUrl } = await checkoutApi.initializeCheckout()
      window.location.href = authorizationUrl
    } catch {
      setError('Something in your cart could not be checked out. Open your cart and remove any items marked "No longer available", then try again.')
      setSubmitting(false)
    }
  }

  const items = cart?.items.filter((item) => item.productId) ?? []
  const unavailableItems = items.filter((item) => !item.productId.isActive)
  const blocked = cart && (items.length === 0 || unavailableItems.length > 0)

  return (
    <div className="card">
      <h1>Checkout</h1>

      {!cart && !error && <p className="muted">Loading…</p>}

      {cart && items.length === 0 && (
        <p className="muted">Your cart is empty. Add something before checking out.</p>
      )}

      {unavailableItems.length > 0 && (
        <p className="error">
          {unavailableItems.length === 1 ? 'One item' : `${unavailableItems.length} items`} in your cart
          {unavailableItems.length === 1 ? ' is' : ' are'} no longer available. Open your cart and remove{' '}
          {unavailableItems.length === 1 ? 'it' : 'them'} before checking out.
        </p>
      )}

      {cart && (
        <form onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting || blocked}>
            {submitting ? 'Redirecting to Paystack...' : 'Pay with Paystack'}
          </button>
        </form>
      )}

      <Link to="/products" className="link-button">
        Back to products
      </Link>
    </div>
  )
}

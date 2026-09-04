import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as checkoutApi from '../api/checkout'

export default function Checkout() {
  const { user } = useAuth()
  const [address, setAddress] = useState({
    line1: user.address?.line1 || '',
    city: user.address?.city || '',
    state: user.address?.state || '',
    country: user.address?.country || '',
    postalCode: user.address?.postalCode || '',
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { authorizationUrl } = await checkoutApi.initializeCheckout(address)
      window.location.href = authorizationUrl
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Shipping address</legend>
          <label>
            Address line
            <input
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              required
            />
          </label>
          <label>
            City
            <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
          </label>
          <label>
            State
            <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
          </label>
          <label>
            Country
            <input
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
              required
            />
          </label>
          <label>
            Postal code
            <input
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
          </label>
        </fieldset>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Redirecting to Paystack...' : 'Pay with Paystack'}
        </button>
      </form>
    </div>
  )
}

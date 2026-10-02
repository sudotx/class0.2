import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as checkoutApi from '../api/checkout'
import { useCart } from '../context/CartContext'

export default function CheckoutCallback() {
  const [searchParams] = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const { refresh } = useCart()

  useEffect(() => {
    if (!reference) {
      setError('Missing payment reference.')
      return
    }
    checkoutApi.verifyCheckout(reference).then((data) => {
      setResult(data)
      if (data.status === 'paid') {
        refresh()
      }
    }).catch((err) => setError(err.message))
  }, [reference, refresh])

  if (error) return <p className="error">{error}</p>
  if (!result) return <p>Verifying payment...</p>

  return (
    <div className="card">
      <h1>{result.status === 'paid' ? 'Payment successful' : 'Payment ' + result.status}</h1>
      <Link to="/orders">View your orders</Link>
    </div>
  )
}

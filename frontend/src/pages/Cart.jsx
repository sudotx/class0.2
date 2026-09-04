import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as cartApi from '../api/cart'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function load() {
    cartApi.getCart().then(setCart).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  async function updateQuantity(productId, quantity) {
    try {
      const updated = await cartApi.updateItem(productId, quantity)
      setCart(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeItem(productId) {
    try {
      await cartApi.removeItem(productId)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!cart) return <p>Loading...</p>

  const items = cart.items.filter((item) => item.productId)
  const total = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0)

  return (
    <div>
      <h1>Your cart</h1>
      {items.length === 0 && <p>Cart is empty.</p>}
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.productId._id}>
            <span>{item.productId.name}</span>
            <input
              type="number"
              min={0}
              max={item.productId.stock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.productId._id, Number(e.target.value))}
            />
            <span>${(item.productId.price * item.quantity).toFixed(2)}</span>
            <button type="button" onClick={() => removeItem(item.productId._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <div className="cart-summary">
          <p>Total: ${total.toFixed(2)}</p>
          <button type="button" onClick={() => navigate('/checkout')}>
            Checkout
          </button>
        </div>
      )}
      <Link to="/products">Continue shopping</Link>
    </div>
  )
}

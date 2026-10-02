import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as cartApi from '../api/cart'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { isOpen, closeDrawer, syncFromCart } = useCart()
  const dialogRef = useRef(null)
  const [cart, setCart] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  function load() {
    cartApi
      .getCart()
      .then((data) => {
        setCart(data)
        syncFromCart(data)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      load()
      dialog.showModal()
    } else {
      dialog.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  async function updateQuantity(productId, quantity) {
    try {
      const updated = await cartApi.updateItem(productId, quantity)
      setCart(updated)
      syncFromCart(updated)
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

  function handleCheckout() {
    closeDrawer()
    navigate('/checkout')
  }

  const allItems = cart?.items.filter((item) => item.productId) ?? []
  const items = allItems.filter((item) => item.productId.isActive)
  const unavailableItems = allItems.filter((item) => !item.productId.isActive)
  const total = items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0)

  return (
    <dialog
      ref={dialogRef}
      className="cart-drawer"
      onClose={closeDrawer}
      onClick={(e) => {
        if (e.target === dialogRef.current) closeDrawer()
      }}
    >
      <div className="cart-drawer-header">
        <h2>Your cart</h2>
        <button type="button" className="cart-drawer-close" onClick={closeDrawer} aria-label="Close cart">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {!cart && !error && <p className="muted">Loading…</p>}
      {cart && allItems.length === 0 && <p className="muted">Cart is empty.</p>}

      {items.length > 0 && (
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.productId._id}>
              <div className="cart-item-media">
                {item.productId.images?.[0] && (
                  <img src={item.productId.images[0].url} alt="" />
                )}
              </div>
              <div className="cart-item-info">
                <span className="cart-item-name">{item.productId.name}</span>
                <input
                  type="number"
                  min={0}
                  max={item.productId.stock}
                  value={item.quantity}
                  aria-label={`Quantity for ${item.productId.name}`}
                  onChange={(e) => updateQuantity(item.productId._id, Number(e.target.value))}
                />
              </div>
              <span className="cart-item-price">${(item.productId.price * item.quantity).toFixed(2)}</span>
              <button
                type="button"
                className="cart-item-remove"
                onClick={() => removeItem(item.productId._id)}
                aria-label={`Remove ${item.productId.name}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {unavailableItems.length > 0 && (
        <ul className="cart-list cart-list-unavailable">
          {unavailableItems.map((item) => (
            <li key={item.productId._id}>
              <div className="cart-item-media">
                {item.productId.images?.[0] && <img src={item.productId.images[0].url} alt="" />}
              </div>
              <div className="cart-item-info">
                <span className="cart-item-name">{item.productId.name}</span>
                <span className="cart-item-tag">No longer available</span>
              </div>
              <span />
              <button
                type="button"
                className="cart-item-remove"
                onClick={() => removeItem(item.productId._id)}
                aria-label={`Remove ${item.productId.name}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {allItems.length > 0 && (
        <div className="cart-summary">
          <p>Total: ${total.toFixed(2)}</p>
          <button type="button" onClick={handleCheckout} disabled={items.length === 0 || unavailableItems.length > 0}>
            Checkout
          </button>
          {unavailableItems.length > 0 && (
            <p className="cart-summary-hint">Remove unavailable items above to check out.</p>
          )}
        </div>
      )}
    </dialog>
  )
}

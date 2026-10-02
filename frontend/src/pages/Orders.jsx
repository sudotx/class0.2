import { useEffect, useState } from 'react'
import * as ordersApi from '../api/orders'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    ordersApi
      .listOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1>Your orders</h1>

      {loading && <p className="muted">Loading orders…</p>}
      {!loading && orders.length === 0 && <p className="muted">No orders yet.</p>}

      {!loading && orders.length > 0 && (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order._id}>
              <div className="order-header">
                <div>
                  <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="order-total">${order.totalAmount.toFixed(2)}</p>
                </div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <ul className="order-items">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    <span className="order-item-name">
                      {item.name} <span className="order-item-qty">×{item.quantity}</span>
                    </span>
                    <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

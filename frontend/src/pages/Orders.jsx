import { useEffect, useState } from 'react'
import * as ordersApi from '../api/orders'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    ordersApi.listOrders().then(setOrders).catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1>Your orders</h1>
      {orders.length === 0 && <p>No orders yet.</p>}
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order._id}>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className={`status status-${order.status}`}>{order.status}</span>
            <span>${order.totalAmount.toFixed(2)}</span>
            <ul>
              {order.items.map((item) => (
                <li key={item.productId}>
                  {item.name} x{item.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

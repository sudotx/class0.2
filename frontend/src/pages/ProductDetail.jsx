import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import * as productsApi from '../api/products'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    productsApi.getProduct(id).then(setProduct).catch((err) => setError(err.message))
  }, [id])

  async function handleAddToCart() {
    setStatus(null)
    setError(null)
    try {
      await addItem(id, Number(quantity))
      setStatus('Added to cart.')
    } catch (err) {
      setError(err.message)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!product) return <p>Loading...</p>

  return (
    <div className="product-detail-page">
      <h1>{product.name}</h1>
      <div className="card product-detail-card">
        <div className="product-detail-layout">
          <div className="product-detail-media">
            {product.images?.[0] && (
              <img src={product.images[0].url} alt={product.name} />
            )}
          </div>
          <div className="product-detail-info">
            <p className="product-detail-description">{product.description}</p>
            <p className="price product-detail-price">${product.price.toFixed(2)}</p>
            <p className="product-detail-stock">In stock: {product.stock}</p>

            {user ? (
              <div className="add-to-cart">
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <button type="button" onClick={handleAddToCart} disabled={product.stock === 0}>
                  Add to cart
                </button>
              </div>
            ) : (
              <p className="muted">Log in to add this to your cart.</p>
            )}
            {status && <p className="success">{status}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

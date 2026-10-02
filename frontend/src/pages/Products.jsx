import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import * as productsApi from '../api/products'

export default function Products() {
  const { user } = useAuth()
  const { addItem } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingId, setAddingId] = useState(null)
  const [addedId, setAddedId] = useState(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 6

  useEffect(() => {
    setLoading(true)
    productsApi
      .listProducts(`?page=${page}&limit=${limit}`)
      .then((data) => {
        setProducts(data.products)
        setTotal(data.total)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  async function quickAdd(product) {
    setAddingId(product._id)
    try {
      await addItem(product._id, 1)
      setAddedId(product._id)
      setTimeout(() => setAddedId(null), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingId(null)
    }
  }

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1 style={{ textAlign: 'left' }}>Products</h1>

      {loading && <p className="muted">Loading products…</p>}

      {!loading && products.length === 0 && <p className="muted">No products yet.</p>}

      {!loading && products.length > 0 && (
        <ul className="product-grid">
          {products.map((product) => {
            const soldOut = product.stock === 0
            return (
              <li key={product._id} className="product-card">
                <Link to={`/products/${product._id}`} className="product-card-media">
                  {product.images?.[0] ? (
                    <img src={product.images[0].url} alt={product.name} />
                  ) : (
                    <div className="product-card-placeholder" aria-hidden="true" />
                  )}
                  {soldOut && <span className="product-card-tag">Sold out</span>}
                </Link>
                <div className="product-card-body">
                  <div className="product-card-title-row">
                    <Link to={`/products/${product._id}`} className="product-card-title">
                      {product.name}
                    </Link>
                    <span className="price">${product.price.toFixed(2)}</span>
                  </div>
                  {user && (
                    <button
                      type="button"
                      className="product-card-add"
                      onClick={() => quickAdd(product)}
                      disabled={soldOut || addingId === product._id}
                    >
                      {addedId === product._id ? 'Added' : 'Add'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            Previous
          </button>
          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={n === page ? 'pagination-page active' : 'pagination-page'}
                onClick={() => setPage(n)}
                disabled={n === page}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productsApi from '../api/products'

export default function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    productsApi
      .listProducts()
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <h1>Products</h1>
      <div className="grid">
        {products.map((product) => (
          <Link key={product._id} to={`/products/${product._id}`} className="product-card">
            {product.images?.[0] && <img src={product.images[0].url} alt={product.name} />}
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </Link>
        ))}
        {products.length === 0 && <p>No products yet.</p>}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import * as productsApi from '../../api/products'

const emptyForm = { name: '', description: '', price: '', stock: '', category: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)

  function load() {
    productsApi.listProducts().then((data) => setProducts(data.products)).catch((err) => setError(err.message))
  }

  useEffect(load, [])

  function toFormData() {
    const formData = new FormData()
    for (const [key, value] of Object.entries(form)) formData.append(key, value)
    for (const file of files) formData.append('images', file)
    return formData
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (editingId) {
        await productsApi.updateProduct(editingId, toFormData())
      } else {
        await productsApi.createProduct(toFormData())
      }
      setForm(emptyForm)
      setFiles([])
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(product) {
    setEditingId(product._id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
    })
  }

  async function handleDelete(id) {
    try {
      await productsApi.deleteProduct(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>Manage products</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="card">
        <h2>{editingId ? 'Edit product' : 'New product'}</h2>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          Price
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </label>
        <label>
          Category
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </label>
        <label>
          Images
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} />
        </label>
        <button type="submit">{editingId ? 'Save changes' : 'Create product'}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null)
              setForm(emptyForm)
            }}
          >
            Cancel edit
          </button>
        )}
      </form>

      <ul className="admin-product-list">
        {products.map((product) => (
          <li key={product._id}>
            <span>{product.name}</span>
            <span>${product.price.toFixed(2)}</span>
            <span>stock: {product.stock}</span>
            <button type="button" onClick={() => startEdit(product)}>
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(product._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

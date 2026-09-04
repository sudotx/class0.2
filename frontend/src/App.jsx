import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import Nav from './components/Nav'

import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutCallback from './pages/CheckoutCallback'
import Orders from './pages/Orders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <main className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/checkout/callback" element={<CheckoutCallback />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}

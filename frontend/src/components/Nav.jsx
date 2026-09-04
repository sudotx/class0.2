import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand">
        Orbit Store
      </Link>
      <div className="nav-links">
        <Link to="/products">Products</Link>
        {user && <Link to="/cart">Cart</Link>}
        {user && <Link to="/orders">Orders</Link>}
        {user?.role === 'admin' && <Link to="/admin/products">Manage Products</Link>}
        {user?.role === 'admin' && <Link to="/admin/users">Users</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user ? (
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Nav() {
  const { user, logout } = useAuth()
  const { count, bump, openDrawer } = useCart()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand">
        <span className="brand-mark" aria-hidden="true" />
        Orbit Store
      </Link>

      <div className="nav-links">
        <NavLink to="/products">Products</NavLink>
        {user && <NavLink to="/orders">Orders</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin/products">Manage Products</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin/users">Users</NavLink>}
        {user && <NavLink to="/profile">Profile</NavLink>}
      </div>

      <div className="nav-actions">
        {user && (
          <button
            type="button"
            className="nav-cart"
            onClick={openDrawer}
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className={`cart-badge${bump ? ' cart-badge-bump' : ''}`}>{count}</span>}
          </button>
        )}
        {user ? (
          <button
            type="button"
            className="nav-logout"
            onClick={handleLogout}
            aria-label="Log out"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <Link to="/register" className="nav-cta">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

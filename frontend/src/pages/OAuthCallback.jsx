import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OAuthCallback() {
  const { loginWithToken } = useAuth()
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
    if (!token) {
      setError('Missing token from Google sign-in.')
      return
    }
    loginWithToken(token)
      .then(() => setDone(true))
      .catch((err) => setError(err.message))
  }, [loginWithToken])

  if (error) return <p className="error">{error}</p>
  if (done) return <Navigate to="/products" replace />
  return <p>Signing in with Google...</p>
}

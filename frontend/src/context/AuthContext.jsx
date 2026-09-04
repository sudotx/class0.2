import { createContext, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import * as usersApi from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false)
      return
    }
    usersApi
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(credentials) {
    const { token } = await authApi.login(credentials)
    localStorage.setItem('token', token)
    const me = await usersApi.getMe()
    setUser(me)
    return me
  }

  async function register(data) {
    await authApi.register(data)
    return login({ username: data.username, password: data.password })
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  async function refreshMe() {
    const me = await usersApi.getMe()
    setUser(me)
    return me
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

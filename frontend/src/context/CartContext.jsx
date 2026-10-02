import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as cartApi from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

function itemCount(cart) {
  return cart.items
    .filter((item) => item.productId?.isActive)
    .reduce((sum, item) => sum + item.quantity, 0)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [bump, setBump] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = useCallback(() => setIsOpen(true), [])
  const closeDrawer = useCallback(() => setIsOpen(false), [])

  const syncFromCart = useCallback((cart) => {
    const next = itemCount(cart)
    setCount((prev) => {
      if (next > prev) {
        setBump(true)
        setTimeout(() => setBump(false), 500)
      }
      return next
    })
  }, [])

  const refresh = useCallback(() => {
    if (!user) {
      setCount(0)
      return
    }
    cartApi.getCart().then(syncFromCart).catch(() => {})
  }, [user, syncFromCart])

  useEffect(refresh, [refresh])

  async function addItem(productId, quantity) {
    const cart = await cartApi.addItem(productId, quantity)
    syncFromCart(cart)
    return cart
  }

  return (
    <CartContext.Provider
      value={{ count, bump, refresh, addItem, syncFromCart, isOpen, openDrawer, closeDrawer }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

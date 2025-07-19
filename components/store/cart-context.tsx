"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      toast({
        title: "Error loading cart",
        description: "There was an issue loading your previous cart items.",
        variant: "destructive",
      })
    } finally {
      setIsInitialized(true)
    }
  }, [toast])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("cart", JSON.stringify(cart))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
        toast({
          title: "Error saving cart",
          description: "There was an issue saving your cart items.",
          variant: "destructive",
        })
      }
    }
  }, [cart, isInitialized, toast])

  const addToCart = useCallback(
    (item: CartItem) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find((i) => i.id === item.id)
        if (existingItem) {
          toast({
            title: "Item updated",
            description: `${item.name} quantity updated in cart.`,
          })
          return prevCart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
        } else {
          toast({
            title: "Item added to cart",
            description: `${item.name} has been added to your cart.`,
          })
          return [...prevCart, { ...item, quantity: item.quantity || 1 }]
        }
      })
    },
    [toast],
  )

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((prevCart) => {
        const itemToRemove = prevCart.find((i) => i.id === id)
        if (itemToRemove) {
          toast({
            title: "Item removed",
            description: `${itemToRemove.name} has been removed from your cart.`,
          })
        }
        return prevCart.filter((item) => item.id !== id)
      })
    },
    [toast],
  )

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => item.id !== id)
      }
      return prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    toast({
      title: "Cart cleared",
      description: "Your shopping cart has been emptied.",
    })
  }, [toast])

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  const getItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }, [cart])

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isCheckingOut: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_CHECKOUT_LOADING"; payload: boolean }

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  checkout: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      const quantity = action.payload.quantity || 1

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      } else {
        const newItems = [...state.items, { ...action.payload, quantity }]
        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      }
    }
    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        const filteredItems = state.items.filter((item) => item.id !== action.payload.id)
        return {
          ...state,
          items: filteredItems,
          total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      }
    case "LOAD_CART": {
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: action.payload.reduce((sum, item) => sum + item.quantity, 0),
      }
    }
    case "SET_CHECKOUT_LOADING":
      return {
        ...state,
        isCheckingOut: action.payload,
      }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    isCheckingOut: false,
  })
  const { toast } = useToast()
  const { user } = useAuth()

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("kelvin-creekman-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("kelvin-creekman-cart", JSON.stringify(state.items))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [state.items])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item })
    toast({
      title: "Added to cart! 🛒",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const removeItem = (id: string) => {
    const item = state.items.find((item) => item.id === id)
    dispatch({ type: "REMOVE_ITEM", payload: id })
    if (item) {
      toast({
        title: "Removed from cart",
        description: `${item.name} has been removed from your cart.`,
      })
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const checkout = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your purchase.",
        variant: "destructive",
      })
      return
    }

    if (state.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    try {
      dispatch({ type: "SET_CHECKOUT_LOADING", payload: true })

      const response = await fetch("/api/create-store-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: state.items,
          userId: user.id,
          total: state.total,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error: any) {
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your checkout.",
        variant: "destructive",
      })
    } finally {
      dispatch({ type: "SET_CHECKOUT_LOADING", payload: false })
    }
  }

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout,
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

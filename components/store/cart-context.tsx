"use client"

import { useState } from "react"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export interface CartItem {
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
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      let newItems: CartItem[]

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
        )
      } else {
        newItems = [...state.items, action.payload]
      }

      const newTotal = newItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const newTotal = newItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )

      const newTotal = newItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
      const newItemCount = newItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
      }

    case "LOAD_CART":
      return action.payload

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("kelvin-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (parsedCart && Array.isArray(parsedCart.items)) {
          dispatch({ type: "LOAD_CART", payload: parsedCart })
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("kelvin-cart", JSON.stringify(state))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [state, isInitialized])

  const addItem = useCallback(
    (item: CartItem) => {
      dispatch({ type: "ADD_ITEM", payload: item })
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart.`,
      })
    },
    [toast],
  )

  const removeItem = useCallback(
    (id: string) => {
      const item = state.items.find((item) => item.id === id)
      dispatch({ type: "REMOVE_ITEM", payload: id })

      if (item) {
        toast({
          title: "Removed from cart",
          description: `${item.name} has been removed from your cart.`,
        })
      }
    },
    [state.items, toast],
  )

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }, [toast])

  const getItemQuantity = useCallback(
    (id: string): number => {
      const item = state.items.find((item) => item.id === id)
      return item ? item.quantity : 0
    },
    [state.items],
  )

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
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

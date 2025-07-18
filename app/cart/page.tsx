"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import { useCart } from "@/components/store/cart-context"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { state, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout.",
        variant: "destructive",
      })
      return
    }

    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/create-store-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: state.items,
          userId: user.id,
          userEmail: user.email,
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
        title: "Checkout failed",
        description: error.message || "There was an error processing your checkout.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild>
              <Link href="/store">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Button variant="outline" asChild>
              <Link href="/store">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {state.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.size && <Badge variant="outline">Size: {item.size}</Badge>}
                          {item.color && <Badge variant="outline">Color: {item.color}</Badge>}
                        </div>
                        <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
                <p className="text-sm text-muted-foreground">
                  {state.items.length} item{state.items.length !== 1 ? "s" : ""} in cart
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${state.total.toFixed(2)}</span>
                  </div>

                  <Button onClick={handleCheckout} className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  {!user && (
                    <p className="text-sm text-muted-foreground text-center">
                      <Link href="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      to checkout
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

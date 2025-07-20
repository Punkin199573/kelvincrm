"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/components/store/cart-context"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingCart, XCircle, Plus, Minus, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import Link from "next/link"

// Helper to format currency safely
const formatCurrency = (amount: number | string | undefined | null): string => {
  if (typeof amount === "string") {
    amount = Number.parseFloat(amount)
  }
  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00"
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function CartPage() {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (!cartState?.items || cartState.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/create-store-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartState.items,
          userId: user?.id,
          userEmail: user?.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const { url } = await response.json()
      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cartState?.total || 0
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {cartState?.itemCount || 0} {(cartState?.itemCount || 0) === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {!cartState?.items || cartState.items.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="space-y-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold text-muted-foreground">Your cart is empty</h2>
              <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
              <Button asChild>
                <Link href="/store">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartState.items.map((item) => (
                <Card key={item.id} className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg?height=80&width=80"}
                          alt={item.name || "Product"}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name || "Unknown Item"}</h3>
                        <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                        {item.size && <p className="text-sm text-muted-foreground">Size: {item.size}</p>}
                        {item.color && <p className="text-sm text-muted-foreground">Color: {item.color}</p>}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-3 py-1 min-w-[3rem] text-center">{item.quantity || 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Cart Actions */}
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" asChild>
                  <Link href="/store">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-primary/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-primary">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartState.itemCount} items)</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary/90 transition-colors"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>

                  {!user && (
                    <div className="text-center text-sm text-muted-foreground">
                      <Link href="/login" className="text-primary hover:underline">
                        Sign in
                      </Link>{" "}
                      for faster checkout
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground text-center">Secure checkout powered by Stripe</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

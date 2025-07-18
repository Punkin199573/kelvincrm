"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/store/cart-context"
import { useAuth } from "@/components/auth/auth-provider"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Safe price formatting function
const formatPrice = (price: number | undefined | null): string => {
  if (typeof price !== "number" || isNaN(price) || price === null || price === undefined) {
    return "0.00"
  }
  return price.toFixed(2)
}

export default function CartPage() {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

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
        title: "Empty Cart",
        description: "Please add items to your cart before checkout.",
        variant: "destructive",
      })
      return
    }

    // Validate cart items
    const invalidItems = cartState.items.filter(
      (item) => !item.name || typeof item.price !== "number" || item.price <= 0 || item.quantity <= 0,
    )

    if (invalidItems.length > 0) {
      toast({
        title: "Invalid Items",
        description: "Some items in your cart are invalid. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // Redirect to checkout page
      router.push("/checkout")
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: "Failed to proceed to checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleContinueShopping = () => {
    router.push("/store")
  }

  // Empty cart state
  if (!cartState?.items || cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet. Check out our exclusive merchandise!
            </p>
            <Button onClick={handleContinueShopping} size="lg">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {cartState.itemCount} {cartState.itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartState.items.map((item) => (
              <Card key={item.id} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.svg?height=80&width=80"}
                        alt={item.name || "Product"}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.name || "Unknown Item"}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold">${formatPrice(item.price)}</span>
                        {item.size && <Badge variant="secondary">Size: {item.size}</Badge>}
                        {item.color && <Badge variant="secondary">Color: {item.color}</Badge>}
                      </div>
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
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="font-bold text-lg">${formatPrice((item.price || 0) * (item.quantity || 1))}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Cart Actions */}
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={handleContinueShopping}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
                    <span>${formatPrice(cartState.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${formatPrice(cartState.total)}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 transition-colors"
                  size="lg"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    "Processing..."
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
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
      </div>
    </div>
  )
}

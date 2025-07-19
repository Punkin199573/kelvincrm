"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/components/store/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingCart, XCircle } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

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
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (cart.length === 0) {
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
        body: JSON.stringify({ items: cart }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const { url } = await response.json()
      if (url) {
        clearCart() // Clear cart after successful checkout session creation
        router.push(url)
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

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8 text-center">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent className="space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-xl font-semibold text-muted-foreground">Your cart is empty.</p>
            <p className="text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={() => router.push("/store")}>Start Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="flex items-center p-4 shadow-sm">
                <div className="relative w-24 h-24 mr-4 flex-shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg?height=100&width=100&text=Product"}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-md"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                  <div className="flex items-center mt-2">
                    <Label htmlFor={`quantity-${item.id}`} className="sr-only">
                      Quantity
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value))}
                      className="w-20 text-center"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-5 w-5" />
                      <span className="sr-only">Remove {item.name}</span>
                    </Button>
                  </div>
                </div>
                <div className="text-lg font-bold ml-auto">{formatCurrency(item.price * item.quantity)}</div>
              </Card>
            ))}
            <Button variant="outline" onClick={clearCart} className="w-full mt-4 bg-transparent">
              Clear Cart
            </Button>
          </div>

          <Card className="lg:col-span-1 h-fit shadow-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} items)</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatCurrency(getCartTotal())}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} className="w-full" disabled={isProcessing || cart.length === 0}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

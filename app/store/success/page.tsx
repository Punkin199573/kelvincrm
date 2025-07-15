"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, Home, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useCart } from "@/components/store/cart-context"

interface OrderDetails {
  id: string
  total_amount: number
  status: string
  items: any[]
  shipping_address: any
  created_at: string
}

export default function StoreSuccessPage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { clearCart } = useCart()

  const sessionId = searchParams.get("session_id")
  const orderId = searchParams.get("order_id")

  useEffect(() => {
    if (sessionId && orderId) {
      fetchOrderDetails()
      clearCart() // Clear cart after successful payment
    }
  }, [sessionId, orderId])

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (error) throw error

      setOrderDetails(data)
    } catch (error) {
      console.error("Error fetching order details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fire-500 dark:border-ice-400"></div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Order not found</p>
            <Link href="/store">
              <Button className="mt-4">Return to Store</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">Thank you for your purchase! Your order is being prepared.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader>
              <CardTitle className="text-fire-600 dark:text-ice-400 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Order ID:</span>
                <span className="text-sm font-mono">{orderDetails.id.slice(0, 8)}</span>
              </div>

              <div className="space-y-3">
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-fire-600 dark:text-ice-400">${orderDetails.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status */}
          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader>
              <CardTitle className="text-fire-600 dark:text-ice-400 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-fire-500/20 dark:bg-ice-500/20 rounded-full mb-3">
                  <Package className="h-6 w-6 text-fire-500 dark:text-ice-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">On its way to your address!</h3>
                <p className="text-muted-foreground text-sm">
                  Your exclusive Kelvin Creekman merchandise is being carefully prepared and will be shipped soon.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Order Confirmed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(orderDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-sm">Preparing for Shipment</p>
                    <p className="text-xs text-muted-foreground">Your items are being carefully packaged</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Shipped</p>
                    <p className="text-xs text-muted-foreground">You'll receive tracking information</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Delivered</p>
                    <p className="text-xs text-muted-foreground">Enjoy your exclusive merchandise!</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-center">
                  <strong>Estimated delivery:</strong> 3-7 business days
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto bg-transparent">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/store">
            <Button className="w-full sm:w-auto bg-gradient-fire dark:bg-gradient-ice">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Order Confirmation Note */}
        <Card className="mt-8 border-green-500/20 bg-green-500/5">
          <CardContent className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your registered email address with order details and tracking
              information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

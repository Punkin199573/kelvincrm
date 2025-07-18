"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/store/cart-context"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, ShoppingCart, User, Mail, Phone, MapPin } from "lucide-react"

interface CheckoutFormData {
  email: string
  fullName: string
  phone: string
  address: {
    line1: string
    line2: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  specialRequests: string
}

function CheckoutForm() {
  const { user, profile } = useAuth()
  const { cart, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || "",
    fullName: profile?.full_name || "",
    phone: profile?.phone || "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
    specialRequests: "",
  })

  // Get checkout type from URL params
  const checkoutType = searchParams.get("type") || "store"
  const tier = searchParams.get("tier")
  const eventId = searchParams.get("event")
  const sessionId = searchParams.get("session")

  // Calculate totals safely with proper number handling
  const subtotal =
    cart?.items?.reduce((sum, item) => {
      const price = typeof item.price === "number" ? item.price : Number.parseFloat(item.price) || 0
      const quantity = typeof item.quantity === "number" ? item.quantity : Number.parseInt(item.quantity) || 0
      return sum + price * quantity
    }, 0) || 0

  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
  const total = subtotal + tax + shipping

  // Format currency safely
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === "number" ? amount : Number.parseFloat(amount) || 0
    return `$${numAmount.toFixed(2)}`
  }

  useEffect(() => {
    // Redirect if no items in cart for store checkout
    if (checkoutType === "store" && (!cart?.items || cart.items.length === 0)) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      })
      router.push("/store")
      return
    }

    // Pre-fill form with user data
    if (user && profile) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || prev.email,
        fullName: profile.full_name || prev.fullName,
        phone: profile.phone || prev.phone,
      }))
    }
  }, [cart, checkoutType, user, profile, router, toast])

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in your email and full name.",
        variant: "destructive",
      })
      return false
    }

    if (checkoutType === "store") {
      if (
        !formData.address.line1 ||
        !formData.address.city ||
        !formData.address.state ||
        !formData.address.postal_code
      ) {
        toast({
          title: "Missing Address",
          description: "Please fill in your complete shipping address.",
          variant: "destructive",
        })
        return false
      }
    }

    return true
  }

  const handleCheckout = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      let endpoint = ""
      const requestBody: any = {
        customerInfo: formData,
        successUrl: `${window.location.origin}/store/success`,
        cancelUrl: `${window.location.origin}/checkout?type=${checkoutType}`,
      }

      switch (checkoutType) {
        case "store":
          endpoint = "/api/create-store-checkout"
          requestBody.items = cart?.items || []
          requestBody.totals = {
            subtotal: Number.parseFloat(subtotal.toFixed(2)),
            tax: Number.parseFloat(tax.toFixed(2)),
            shipping: Number.parseFloat(shipping.toFixed(2)),
            total: Number.parseFloat(total.toFixed(2)),
          }
          break

        case "membership":
          endpoint = "/api/create-subscription"
          requestBody.tier = tier
          requestBody.successUrl = `${window.location.origin}/signup/success`
          break

        case "event":
          endpoint = "/api/create-event-checkout"
          requestBody.eventId = eventId
          requestBody.successUrl = `${window.location.origin}/events/success`
          break

        case "session":
          endpoint = "/api/create-session-checkout"
          requestBody.sessionId = sessionId
          requestBody.successUrl = `${window.location.origin}/meet-and-greet/success`
          break

        default:
          throw new Error("Invalid checkout type")
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        // Clear cart for store purchases
        if (checkoutType === "store") {
          clearCart()
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to process checkout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCheckoutTitle = () => {
    switch (checkoutType) {
      case "membership":
        return "Complete Your Membership"
      case "event":
        return "Event Registration"
      case "session":
        return "Book Your Session"
      default:
        return "Complete Your Order"
    }
  }

  const getCheckoutDescription = () => {
    switch (checkoutType) {
      case "membership":
        return "Join the fan club and get exclusive access"
      case "event":
        return "Secure your spot at this exclusive event"
      case "session":
        return "Book your personal session with Kelvin"
      default:
        return "Review your order and complete your purchase"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{getCheckoutTitle()}</h1>
          <p className="text-muted-foreground">{getCheckoutDescription()}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          {checkoutType === "store" && cart?.items && cart.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>Review your items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(
                        (typeof item.price === "number" ? item.price : Number.parseFloat(item.price) || 0) *
                          (typeof item.quantity === "number" ? item.quantity : Number.parseInt(item.quantity) || 0),
                      )}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {checkoutType === "store" ? "Shipping Information" : "Contact Information"}
              </CardTitle>
              <CardDescription>
                {checkoutType === "store"
                  ? "Where should we send your order?"
                  : "We'll use this information to contact you"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {checkoutType === "store" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address1">Address Line 1</Label>
                      <Input
                        id="address1"
                        placeholder="123 Main Street"
                        value={formData.address.line1}
                        onChange={(e) => handleInputChange("address.line1", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                      <Input
                        id="address2"
                        placeholder="Apt, suite, etc."
                        value={formData.address.line2}
                        onChange={(e) => handleInputChange("address.line2", e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={formData.address.city}
                          onChange={(e) => handleInputChange("address.city", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={formData.address.state}
                          onChange={(e) => handleInputChange("address.state", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postal">ZIP Code</Label>
                        <Input
                          id="postal"
                          placeholder="10001"
                          value={formData.address.postal_code}
                          onChange={(e) => handleInputChange("address.postal_code", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special instructions or requests..."
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleCheckout} disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {checkoutType === "store" ? `Pay ${formatCurrency(total)}` : "Continue to Payment"}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by Stripe. Your payment information is encrypted and secure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  )
}

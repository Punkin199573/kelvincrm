"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Shield, Check, AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/components/store/cart-context"
import { useAuth } from "@/components/auth/auth-provider"

// Safe price formatting function
const formatPrice = (price: number | undefined | null): string => {
  if (typeof price !== "number" || isNaN(price) || price === null || price === undefined) {
    return "0.00"
  }
  return price.toFixed(2)
}

// Safe currency formatting
const formatCurrency = (currency?: string): string => {
  if (!currency || typeof currency !== "string") {
    return "USD"
  }
  return currency.toUpperCase()
}

const membershipTiers = {
  frost_fan: {
    name: "Frost Fan",
    price: 9.99,
    features: ["Monthly exclusive content", "Fan community access", "Early music releases"],
  },
  blizzard_vip: {
    name: "Blizzard VIP",
    price: 19.99,
    features: [
      "Everything in Frost Fan",
      "Monthly video calls",
      "Exclusive merchandise discounts",
      "Behind-the-scenes content",
    ],
  },
  avalanche_backstage: {
    name: "Avalanche Backstage",
    price: 49.99,
    features: ["Everything in Blizzard VIP", "Weekly 1-on-1 calls", "Signed merchandise", "Concert presales"],
  },
}

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [tier, setTier] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [isSignup, setIsSignup] = useState(false)
  const [currency, setCurrency] = useState<string>("usd")
  const [error, setError] = useState<string>("")
  const [isValidating, setIsValidating] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { state: cartState, clearCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const validateParams = () => {
      setIsValidating(true)
      setError("")

      try {
        const tierParam = searchParams.get("tier")
        const emailParam = searchParams.get("email")
        const signupParam = searchParams.get("signup") === "true"
        const currencyParam = searchParams.get("currency") || "usd"
        const cancelledParam = searchParams.get("cancelled") === "true"

        // Handle cancelled checkout
        if (cancelledParam) {
          toast({
            title: "Checkout Cancelled",
            description: "Your checkout was cancelled. You can try again anytime.",
            variant: "destructive",
          })
        }

        // Validate subscription checkout
        if (tierParam && emailParam) {
          if (!membershipTiers[tierParam as keyof typeof membershipTiers]) {
            setError("Invalid membership tier selected")
            return
          }

          if (!emailParam.includes("@") || !emailParam.includes(".")) {
            setError("Invalid email address")
            return
          }

          setTier(tierParam)
          setEmail(decodeURIComponent(emailParam))
          setIsSignup(signupParam)
          setCurrency(currencyParam.toLowerCase())
        }
        // Validate store checkout
        else if (cartState?.items && cartState.items.length > 0) {
          // Store checkout is valid
          setCurrency(currencyParam.toLowerCase())
        }
        // No valid checkout type
        else {
          setError("No valid checkout session found")
          return
        }
      } catch (err) {
        console.error("Error validating checkout params:", err)
        setError("Invalid checkout parameters")
      } finally {
        setIsValidating(false)
      }
    }

    validateParams()
  }, [searchParams, cartState?.items, toast])

  const handleSubscriptionCheckout = async () => {
    if (!tier || !email) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required information is provided.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          email,
          isSignup,
          currency,
          userId: user?.id,
          successUrl: `${window.location.origin}/signup/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
          cancelUrl: `${window.location.origin}/checkout?tier=${tier}&email=${encodeURIComponent(email)}&signup=${isSignup}&cancelled=true`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (!data.url) {
        throw new Error("No checkout URL received")
      }

      // Store checkout info for success page
      sessionStorage.setItem(
        "checkout_info",
        JSON.stringify({
          type: "subscription",
          tier,
          email,
          isSignup,
          sessionId: data.sessionId,
        }),
      )

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      console.error("Subscription checkout error:", error)
      setError(error.message || "Failed to process checkout")
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStoreCheckout = async () => {
    if (!cartState?.items || cartState.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError("")

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
          currency,
          successUrl: `${window.location.origin}/store/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout?cancelled=true`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (!data.url) {
        throw new Error("No checkout URL received")
      }

      // Store checkout info for success page
      sessionStorage.setItem(
        "checkout_info",
        JSON.stringify({
          type: "store",
          items: cartState.items,
          total: cartState.total,
          sessionId: data.sessionId,
        }),
      )

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error: any) {
      console.error("Store checkout error:", error)
      setError(error.message || "Failed to process checkout")
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Preparing your checkout...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Checkout Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => router.push("/")} className="flex-1">
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedTier = tier ? membershipTiers[tier as keyof typeof membershipTiers] : null
  const isSubscription = isSignup && selectedTier
  const isStoreCheckout = cartState?.items && cartState.items.length > 0
  const cartTotal = cartState?.total || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            {isSubscription ? "Complete Your Membership" : "Complete Your Order"}
          </h1>
          <p className="text-muted-foreground">
            {isSubscription
              ? "You're one step away from joining the exclusive Kelvin Creekman Fan Club"
              : "Review your order and complete your purchase"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isSubscription && selectedTier && (
                <>
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{selectedTier.name} Membership</h3>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                      <Badge variant="secondary" className="text-xs">
                        {formatCurrency(currency)} Currency
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${formatPrice(selectedTier.price)}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">What's included:</h4>
                    <ul className="space-y-2">
                      {selectedTier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${formatPrice(selectedTier.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total (Monthly)</span>
                      <span>${formatPrice(selectedTier.price)}</span>
                    </div>
                  </div>
                </>
              )}

              {isStoreCheckout && cartState?.items && (
                <>
                  <div className="space-y-4">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name || "Product"}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{item.name || "Unknown Item"}</h3>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity || 1}</p>
                          </div>
                        </div>
                        <div className="font-bold">${formatPrice((item.price || 0) * (item.quantity || 1))}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Secure Checkout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isSubscription && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium">Account Email</Label>
                    <p className="text-sm text-muted-foreground mt-1">{email}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <Label className="text-sm font-medium">Membership Tier</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTier?.name}</p>
                  </div>
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your payment is secured by Stripe. We never store your payment information.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  onClick={isSubscription ? handleSubscriptionCheckout : handleStoreCheckout}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isSubscription
                        ? `Pay $${formatPrice(selectedTier?.price)}/month`
                        : `Pay $${formatPrice(cartTotal)}`}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {isSubscription
                    ? "You can cancel your subscription at any time. No long-term commitments."
                    : "You will be redirected to Stripe to complete your payment securely."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

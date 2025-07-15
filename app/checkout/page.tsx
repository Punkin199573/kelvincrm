"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Shield, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/components/store/cart-context"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const membershipTiers = {
  street_rep: { name: "Street Rep", price: 9.99 },
  warri_elite: { name: "Warri Elite", price: 19.99 },
  erigma_circle: { name: "Erigma Circle", price: 49.99 },
}

function CheckoutForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [tier, setTier] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [isSignup, setIsSignup] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { state: cartState, clearCart } = useCart()
  const stripe = useStripe()
  const elements = useElements()

  useEffect(() => {
    const tierParam = searchParams.get("tier")
    const emailParam = searchParams.get("email")
    const signupParam = searchParams.get("signup")

    if (tierParam && emailParam) {
      setTier(tierParam)
      setEmail(decodeURIComponent(emailParam))
      setIsSignup(signupParam === "true")
    } else if (cartState.items.length === 0) {
      router.push("/store")
    }
  }, [searchParams, router, cartState.items.length])

  const handleSubscriptionPayment = async () => {
    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}")

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: signupData.email,
          tier: signupData.tier,
          fullName: signupData.fullName,
          password: signupData.password,
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
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStorePayment = async () => {
    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: cartState.total,
          metadata: {
            user_id: "current_user_id", // This should come from auth
            items: JSON.stringify(
              cartState.items.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                color: item.color,
              })),
            ),
          },
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) return

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent?.status === "succeeded") {
        clearCart()
        toast({
          title: "Payment Successful! 🎉",
          description: "Your order has been placed successfully.",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTier = tier ? membershipTiers[tier as keyof typeof membershipTiers] : null
  const isSubscription = isSignup && selectedTier
  const isStoreCheckout = cartState.items.length > 0

  if (!isSubscription && !isStoreCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent mb-2">
            {isSubscription ? "Complete Your Membership" : "Complete Your Order"}
          </h1>
          <p className="text-muted-foreground">
            {isSubscription
              ? "You're one step away from joining the exclusive Kelvin Creekman Fan Club"
              : "Review your order and complete your purchase"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader>
              <CardTitle className="text-fire-600 dark:text-ice-400">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubscription && selectedTier && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedTier.name} Membership</h3>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${selectedTier.price}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total (Monthly)</span>
                      <span>${selectedTier.price}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <h4 className="font-semibold text-sm">What's included:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        Exclusive content access
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        Fan community access
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        Early music releases
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {isStoreCheckout && (
                <>
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span>${cartState.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader>
              <CardTitle className="text-fire-600 dark:text-ice-400">Payment Details</CardTitle>
              <CardDescription>Secure payment powered by Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isSubscription && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="p-3 bg-muted rounded-lg text-sm">{email}</div>
                </div>
              )}

              {isStoreCheckout && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#424770",
                            "::placeholder": {
                              color: "#aab7c4",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <Button
                  onClick={isSubscription ? handleSubscriptionPayment : handleStorePayment}
                  disabled={isLoading || !stripe}
                  className="w-full bg-gradient-fire dark:bg-gradient-ice hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isSubscription ? `Pay $${selectedTier?.price}/month` : `Pay $${cartState.total.toFixed(2)}`}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  {isSubscription && " You can cancel your subscription at any time."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

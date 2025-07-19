"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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

interface CheckoutFormProps {
  clientSecret: string
  amount: number
  currency: string
  type: "subscription" | "event" | "store"
  metadata?: Record<string, string>
}

const CheckoutFormContent = ({ clientSecret, amount, currency, type, metadata }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)
    setMessage(null)
    setStatus("idle")

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/checkout?payment_intent_client_secret=${clientSecret}`,
      },
    })

    // This point will only be reached if there's an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An unexpected error occurred.")
      setStatus("error")
      toast({
        title: "Payment Error",
        description: error.message || "Please check your card details and try again.",
        variant: "destructive",
      })
    } else {
      setMessage("An unexpected error occurred.")
      setStatus("error")
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const verifyPayment = useCallback(
    async (paymentIntentClientSecret: string) => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentClientSecret, type }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Payment verification failed.")
        }

        const data = await response.json()
        if (data.success) {
          setMessage("Payment successful!")
          setStatus("success")
          toast({
            title: "Payment Successful!",
            description: "Your transaction was completed.",
          })

          // Redirect based on type
          if (type === "subscription") {
            router.replace("/signup/success")
          } else if (type === "event") {
            router.replace(`/events/success?event_id=${metadata?.event_id}`)
          } else if (type === "store") {
            router.replace("/store/success")
          } else {
            router.replace("/dashboard") // Default redirect
          }
        } else {
          setMessage(data.message || "Payment verification failed.")
          setStatus("error")
          toast({
            title: "Payment Verification Failed",
            description: data.message || "There was an issue verifying your payment.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Verification error:", error)
        setMessage(error.message || "An error occurred during payment verification.")
        setStatus("error")
        toast({
          title: "Verification Error",
          description: error.message || "Could not verify payment. Please contact support.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [router, toast, type, metadata],
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentIntentClientSecret = urlParams.get("payment_intent_client_secret")

    if (paymentIntentClientSecret && clientSecret === paymentIntentClientSecret) {
      verifyPayment(paymentIntentClientSecret)
    }
  }, [clientSecret, verifyPayment])

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Complete Your Purchase</CardTitle>
        <CardDescription>
          Total: <span className="font-semibold">{formatCurrency(amount / 100)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground mt-2">{message}</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-6">
              Go to Dashboard
            </Button>
          </div>
        ) : status === "error" ? (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600">Payment Failed</h3>
            <p className="text-muted-foreground mt-2">{message}</p>
            <Button onClick={() => window.location.reload()} className="mt-6">
              Try Again
            </Button>
          </div>
        ) : (
          <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <Button disabled={isLoading || !stripe || !elements} className="mt-6 w-full" id="submit">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay now"}
            </Button>
            {message && (
              <div id="payment-message" className="mt-4 text-sm text-red-500 text-center">
                {message}
              </div>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientSecret = searchParams.get("payment_intent_client_secret")
  const amount = searchParams.get("amount")
  const currency = searchParams.get("currency")
  const type = searchParams.get("type") as "subscription" | "event" | "store"
  const metadata = searchParams.get("metadata") ? JSON.parse(searchParams.get("metadata")!) : {}

  const [initialLoading, setInitialLoading] = useState(true)
  const [checkoutData, setCheckoutData] = useState<{
    clientSecret: string
    amount: number
    currency: string
    type: "subscription" | "event" | "store"
    metadata?: Record<string, string>
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      if (clientSecret && amount && currency && type) {
        setCheckoutData({
          clientSecret,
          amount: Number.parseFloat(amount),
          currency,
          type,
          metadata,
        })
        setInitialLoading(false)
        return
      }

      // If no client secret in URL, assume it's a new checkout for a subscription or event
      // This part needs to be handled by the component that redirects to checkout,
      // e.g., signup form for subscriptions, event booking for events.
      // For now, we'll just show an error if no client secret is provided.
      toast({
        title: "Checkout Error",
        description: "Invalid checkout session. Please try again from the signup or event page.",
        variant: "destructive",
      })
      setInitialLoading(false)
    }

    fetchPaymentIntent()
  }, [clientSecret, amount, currency, type, metadata, toast])

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center py-12 shadow-lg">
          <CardContent className="space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <p className="text-xl font-semibold text-red-500">Checkout Session Invalid</p>
            <p className="text-muted-foreground">Please return to the previous page and try again.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const options = {
    clientSecret: checkoutData.clientSecret,
    appearance: { theme: "stripe" as const },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Elements options={options} stripe={stripePromise}>
        <CheckoutFormContent {...checkoutData} />
      </Elements>
    </div>
  )
}

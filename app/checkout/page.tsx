"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Safe price formatting function
const formatPrice = (price: number | undefined | null): string => {
  if (typeof price !== "number" || isNaN(price) || price === null || price === undefined) {
    return "0.00"
  }
  return price.toFixed(2)
}

const membershipTiers = {
  frost_fan: { name: "Frost Fan", price: 9.99 },
  blizzard_vip: { name: "Blizzard VIP", price: 19.99 },
  avalanche_backstage: { name: "Avalanche Backstage", price: 49.99 },
}

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [tier, setTier] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [isSignup, setIsSignup] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const tierParam = searchParams.get("tier") || "frost_fan"
    const emailParam = searchParams.get("email") || ""
    const signupParam = searchParams.get("signup") === "true"

    setTier(tierParam)
    setEmail(emailParam)
    setIsSignup(signupParam)
  }, [searchParams])

  const selectedTier = membershipTiers[tier as keyof typeof membershipTiers] || membershipTiers.frost_fan
  const price = selectedTier?.price || 0

  const handleCheckout = async () => {
    setIsLoading(true)

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
          priceId: `price_${tier}`, // You'll need to set up these price IDs in Stripe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Complete Your {isSignup ? "Membership" : "Purchase"}
          </h1>
          <p className="text-muted-foreground">
            {isSignup ? "Finalize your fan club membership" : "Complete your purchase"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h3 className="font-semibold">{selectedTier.name}</h3>
                <p className="text-sm text-muted-foreground">Monthly subscription</p>
                {email && <p className="text-sm text-muted-foreground">Email: {email}</p>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${formatPrice(price)}</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${formatPrice(price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${formatPrice(price)}/month</span>
              </div>
            </div>

            <Button onClick={handleCheckout} className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Continue to Payment - $${formatPrice(price)}/month`
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              You will be redirected to Stripe to complete your payment securely. You can cancel your subscription at
              any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

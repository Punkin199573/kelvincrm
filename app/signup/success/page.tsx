"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, Crown, Star, Zap, ArrowRight, Home } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

const tierIcons = {
  frost_fan: Star,
  blizzard_vip: Zap,
  avalanche_backstage: Crown,
}

const tierColors = {
  frost_fan: "text-blue-500",
  blizzard_vip: "text-purple-500",
  avalanche_backstage: "text-yellow-500",
}

const tierNames = {
  frost_fan: "Frost Fan",
  blizzard_vip: "Blizzard VIP",
  avalanche_backstage: "Avalanche Backstage",
}

export default function SignupSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tier, setTier] = useState<string>("")
  const [sessionId, setSessionId] = useState<string>("")
  const [error, setError] = useState<string>("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const processSignupSuccess = async () => {
      try {
        const sessionIdParam = searchParams.get("session_id")
        const tierParam = searchParams.get("tier")

        if (!sessionIdParam || !tierParam) {
          setError("Missing required parameters")
          return
        }

        setSessionId(sessionIdParam)
        setTier(tierParam)

        // Get stored signup data
        const storedData = sessionStorage.getItem("signup_data")
        if (storedData) {
          const signupData = JSON.parse(storedData)

          // Process the successful payment and complete account setup
          await processPaymentSuccess(sessionIdParam, tierParam, signupData)
        }
      } catch (error: any) {
        console.error("Error processing signup success:", error)
        setError("Failed to process signup completion")
      } finally {
        setIsLoading(false)
      }
    }

    processSignupSuccess()
  }, [searchParams])

  const processPaymentSuccess = async (sessionId: string, tier: string, signupData: any) => {
    setIsProcessing(true)

    try {
      // Verify the payment session with Stripe
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          type: "subscription",
          tier,
          userData: signupData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Payment verification failed")
      }

      // Clear stored signup data
      sessionStorage.removeItem("signup_data")

      toast({
        title: "Welcome to the Fan Club!",
        description: "Your membership has been activated successfully.",
      })
    } catch (error: any) {
      console.error("Payment processing error:", error)
      toast({
        title: "Processing Error",
        description: "There was an issue completing your signup. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinueToDashboard = () => {
    router.push("/dashboard")
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Processing your membership...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Signup Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/signup")} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => router.push("/")} className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedTier = tier ? tierNames[tier as keyof typeof tierNames] : "Frost Fan"
  const TierIcon = tier ? tierIcons[tier as keyof typeof tierIcons] : Star
  const tierColor = tier ? tierColors[tier as keyof typeof tierColors] : "text-blue-500"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Welcome to the Fan Club! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Your {selectedTier} membership has been activated successfully.
          </p>
        </div>

        {/* Membership Details */}
        <Card className="border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TierIcon className={`h-6 w-6 ${tierColor}`} />
                <span>{selectedTier} Membership</span>
              </div>
              <Badge className="ml-auto bg-green-500 text-white">Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Account Email</h3>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Member Since</h3>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-3">Your Membership Includes:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Monthly exclusive content access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Fan community access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Early music releases
                </li>
                {tier !== "frost_fan" && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Priority event access
                  </li>
                )}
                {tier === "avalanche_backstage" && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Backstage meet & greet opportunities
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleContinueToDashboard}
            className="bg-primary hover:bg-primary/90 transition-colors"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up dashboard...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} size="lg">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-8 border-green-500/20 bg-green-500/5">
          <CardContent className="text-center py-6">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <p className="text-sm text-muted-foreground">
              Check your email for a welcome message with additional details about your membership benefits. You can
              manage your subscription and access exclusive content from your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

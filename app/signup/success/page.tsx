"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Mail, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function SignupSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      // Complete the signup process
      completeSignup(sessionId)
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  const completeSignup = async (sessionId: string) => {
    try {
      // Get signup data from session storage
      const signupData = JSON.parse(sessionStorage.getItem("signup_data") || "{}")

      if (signupData.email && signupData.password && signupData.fullName && signupData.tier) {
        // Create the user account
        await signUp(signupData.email, signupData.password, signupData.fullName, signupData.tier)

        // Clear signup data
        sessionStorage.removeItem("signup_data")

        setSessionData({
          tier: signupData.tier,
          email: signupData.email,
          fullName: signupData.fullName,
        })
      }
    } catch (error: any) {
      console.error("Error completing signup:", error)
      toast({
        title: "Signup Error",
        description: "There was an issue completing your signup. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case "avalanche_backstage":
        return { name: "Avalanche Backstage", price: 49.99, color: "from-yellow-500 to-orange-500" }
      case "blizzard_vip":
        return { name: "Blizzard VIP", price: 19.99, color: "from-purple-500 to-blue-500" }
      case "frost_fan":
      default:
        return { name: "Frost Fan", price: 9.99, color: "from-blue-400 to-cyan-500" }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Completing your signup...</p>
        </div>
      </div>
    )
  }

  const tierInfo = sessionData ? getTierInfo(sessionData.tier) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Welcome to the Fan Club!
          </h1>
          <p className="text-muted-foreground">
            Your account has been created successfully and your subscription is now active.
          </p>
        </div>

        <Card className="border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Crown className="h-5 w-5" />
              Membership Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionData && tierInfo && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Membership Tier:</span>
                  <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white`}>{tierInfo.name}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Price:</span>
                  <span className="font-semibold">${tierInfo.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{sessionData.email}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Check Your Email</h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  We've sent a confirmation email to verify your account. Please check your inbox and click the
                  verification link to complete your setup.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
            size="lg"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button onClick={() => router.push("/content")} variant="outline" className="w-full" size="lg">
            Explore Exclusive Content
          </Button>
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:support@kelvincreekman.com" className="text-primary hover:underline">
              support@kelvincreekman.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

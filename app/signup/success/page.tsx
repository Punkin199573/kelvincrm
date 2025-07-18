"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Crown, Star, Zap, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth/auth-provider"

const membershipTiers = {
  frost_fan: { name: "Frost Fan", icon: Star, color: "bg-blue-500" },
  blizzard_vip: { name: "Blizzard VIP", icon: Zap, color: "bg-purple-500" },
  avalanche_backstage: { name: "Avalanche Backstage", icon: Crown, color: "bg-yellow-500" },
}

export default function SignupSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, profile } = useAuth()

  useEffect(() => {
    const processSuccess = async () => {
      try {
        const sessionId = searchParams.get("session_id")
        const tier = searchParams.get("tier")

        if (!sessionId) {
          setError("No session ID found")
          return
        }

        // Get stored signup data
        const storedData = sessionStorage.getItem("signup_data")
        if (storedData) {
          const signupData = JSON.parse(storedData)
          setSessionData({ ...signupData, tier, sessionId })

          // Clear stored data
          sessionStorage.removeItem("signup_data")
        } else {
          setSessionData({ tier, sessionId })
        }

        // Show success message
        toast({
          title: "Welcome to the Fan Club!",
          description: "Your membership has been activated successfully.",
        })

        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (error: any) {
        console.error("Error processing success:", error)
        setError("Failed to process signup completion")
      } finally {
        setIsLoading(false)
      }
    }

    processSuccess()
  }, [searchParams, router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Processing your membership...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const tierData = sessionData?.tier ? membershipTiers[sessionData.tier as keyof typeof membershipTiers] : null
  const TierIcon = tierData?.icon || Star

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to the Fan Club!
          </CardTitle>
          <p className="text-muted-foreground">
            Your membership has been successfully activated. Get ready for exclusive content and experiences!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {tierData && (
            <div className="flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className={`p-2 rounded-full ${tierData.color}`}>
                <TierIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{tierData.name} Member</h3>
                <p className="text-sm text-muted-foreground">Your exclusive membership is now active</p>
              </div>
              <Badge className="ml-auto">Active</Badge>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">What's Next?</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Access exclusive content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Join the fan community
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Get early music releases
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Book exclusive sessions
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Account Details</h4>
              <div className="space-y-2 text-sm">
                {sessionData?.email && (
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span>{sessionData.email}</span>
                  </div>
                )}
                {sessionData?.fullName && (
                  <div>
                    <span className="text-muted-foreground">Name: </span>
                    <span>{sessionData.fullName}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant="secondary">Active Member</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={() => router.push("/dashboard")} className="flex-1">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => router.push("/content")} className="flex-1">
              Explore Content
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You will be automatically redirected to your dashboard in a few seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

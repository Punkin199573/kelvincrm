"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function SignupSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signUp } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const processSignup = async () => {
      try {
        // Get signup data from session storage
        const signupDataStr = sessionStorage.getItem("signup_data")
        if (!signupDataStr) {
          // No signup data, redirect to signup
          router.replace("/signup")
          return
        }

        const signupData = JSON.parse(signupDataStr)

        // Check if user is already authenticated
        if (user) {
          // User is already signed in, redirect to dashboard
          sessionStorage.removeItem("signup_data")
          router.replace("/dashboard")
          return
        }

        // Check if this is coming from a successful payment
        const sessionId = searchParams.get("session_id")
        if (sessionId) {
          setIsProcessing(true)

          // Complete the signup process
          const { error } = await signUp(signupData.email, signupData.password, {
            full_name: signupData.fullName,
            membership_tier: signupData.tier,
          })

          if (error) {
            console.error("Error completing signup:", error)
            toast({
              title: "Signup Error",
              description: "There was an error completing your signup. Please contact support.",
              variant: "destructive",
            })
          } else {
            // Clear signup data
            sessionStorage.removeItem("signup_data")

            toast({
              title: "Welcome!",
              description: "Your account has been created and your membership is active.",
            })

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.replace("/dashboard")
            }, 2000)
          }
        }
      } catch (error) {
        console.error("Error processing signup:", error)
        toast({
          title: "Error",
          description: "There was an error processing your signup.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsProcessing(false)
      }
    }

    processSignup()
  }, [user, searchParams, router, signUp, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            {isProcessing ? "Processing..." : "Welcome to the Fan Club!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isProcessing ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-muted-foreground">We're setting up your account and activating your membership...</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Your account has been created successfully and your membership is now active!
              </p>
              <p className="text-sm text-muted-foreground">
                You'll be redirected to your dashboard shortly, or you can click the button below.
              </p>
              <Button onClick={() => router.replace("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignupSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      // Verify the session was successful
      verifySession(sessionId)
    } else {
      router.push("/signup")
    }
  }, [searchParams, router])

  const verifySession = async (sessionId: string) => {
    try {
      // In a real app, you'd verify the session with your backend
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear signup data from session storage
      sessionStorage.removeItem("signup_data")

      setSuccess(true)
      toast({
        title: "Account created successfully! 🎉",
        description: "Welcome to the Kelvin Creekman Fan Club!",
      })
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "There was an error verifying your payment. Please contact support.",
        variant: "destructive",
      })
      router.push("/signup")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-fire-500 dark:text-ice-500" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md border-fire-500/20 dark:border-ice-500/20 bg-background/50 backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-fire-600 dark:text-ice-400">Welcome to the Club! 🎸</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your account has been created successfully and your subscription is now active. You can now access all the
            exclusive content and features.
          </p>

          <div className="space-y-2">
            <Button onClick={() => router.push("/login")} className="w-full bg-gradient-fire dark:bg-gradient-ice">
              Sign In to Your Account
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

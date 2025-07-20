"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)

  const { signIn, resetPassword } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateForm = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return false
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signIn(email.trim(), password)

      if (error) {
        let errorMessage = "Invalid email or password."

        if (error.message?.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message?.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link before signing in."
        } else if (error.message?.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment before trying again."
        } else if (error.message?.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message) {
          errorMessage = error.message
        }

        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Successful login - redirect to dashboard
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      // Small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/dashboard")
      }, 100)
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsResetLoading(true)

    try {
      await resetPassword(email.trim())
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResetLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-primary/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-primary">Welcome Back</CardTitle>
          <p className="text-center text-muted-foreground">Sign in to your Kelvin Creekman fan account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-primary/20 focus:border-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-primary hover:text-primary/80"
              onClick={handleResetPassword}
              disabled={isResetLoading || isLoading}
            >
              {isResetLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Forgot your password?
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

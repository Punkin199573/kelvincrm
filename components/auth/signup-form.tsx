"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Check, Crown, Star, Zap } from "lucide-react"

const membershipTiers = [
  {
    id: "frost_fan",
    name: "Frost Fan",
    price: 9.99,
    icon: Star,
    color: "bg-blue-500",
    features: ["Monthly exclusive content", "Fan community access", "Early music releases", "Digital downloads"],
  },
  {
    id: "blizzard_vip",
    name: "Blizzard VIP",
    price: 19.99,
    icon: Zap,
    color: "bg-purple-500",
    popular: true,
    features: [
      "Everything in Frost Fan",
      "Monthly video calls",
      "Exclusive merchandise discounts",
      "Behind-the-scenes content",
      "Priority customer support",
    ],
  },
  {
    id: "avalanche_backstage",
    name: "Avalanche Backstage",
    price: 49.99,
    icon: Crown,
    color: "bg-yellow-500",
    features: [
      "Everything in Blizzard VIP",
      "Weekly 1-on-1 video calls",
      "Signed merchandise",
      "Concert ticket presales",
      "Personal song requests",
      "Birthday video messages",
    ],
  },
]

// Safe price formatting function
const formatPrice = (price: number | undefined | null): string => {
  if (typeof price !== "number" || isNaN(price) || price === null || price === undefined) {
    return "0.00"
  }
  return price.toFixed(2)
}

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [selectedTier, setSelectedTier] = useState("blizzard_vip")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { signUp } = useAuth()
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
        description: "Please enter a password.",
        variant: "destructive",
      })
      return false
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return false
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return false
    }

    if (!fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name.",
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
      // Store signup data for checkout process
      const signupData = {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        tier: selectedTier,
      }

      sessionStorage.setItem("signup_data", JSON.stringify(signupData))

      // Create user account
      const { error } = await signUp(email, password, {
        full_name: fullName.trim(),
        membership_tier: selectedTier,
      })

      if (error) {
        let errorMessage = "An error occurred during sign up."

        if (error.message?.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead."
        } else if (error.message?.includes("Password should be at least")) {
          errorMessage = "Password must be at least 6 characters long."
        } else if (error.message?.includes("Unable to validate email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message?.includes("For security purposes")) {
          errorMessage = "Please wait a moment before trying again."
        } else if (error.message?.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message?.includes("Signup requires a valid password")) {
          errorMessage = "Please enter a valid password."
        } else if (error.message) {
          errorMessage = error.message
        }

        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      // Redirect to checkout for payment
      const checkoutUrl = `/checkout?tier=${selectedTier}&email=${encodeURIComponent(email)}&signup=true`
      router.push(checkoutUrl)
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get selected tier safely
  const getSelectedTier = () => {
    return membershipTiers.find((t) => t.id === selectedTier) || membershipTiers[1]
  }

  const selectedTierData = getSelectedTier()

  return (
    <div className="space-y-6">
      {/* Membership Tier Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Choose Your Membership</Label>
        <div className="grid gap-3">
          {membershipTiers.map((tier) => {
            const Icon = tier.icon
            return (
              <Card
                key={tier.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTier === tier.id ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                } ${tier.popular ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${tier.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      {tier.popular && <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${formatPrice(tier.price)}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Account Details Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="pr-10"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            `Continue to Payment - $${formatPrice(selectedTierData.price)}/month`
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in here
          </Link>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </Link>
        </p>
      </form>
    </div>
  )
}

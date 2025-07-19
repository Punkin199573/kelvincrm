"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "./auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [membershipTier, setMembershipTier] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!membershipTier) {
      toast({
        title: "Membership Tier Required",
        description: "Please select a membership tier to continue.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const { error } = await signUp(email, password, { full_name: fullName, membership_tier: membershipTier })

    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred during sign up.",
        variant: "destructive",
      })
      setIsLoading(false)
    } else {
      // If signup is successful, proceed to create checkout session for the membership
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tier: membershipTier,
            email: email,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create checkout session.")
        }

        const { url, clientSecret, amount, currency, type, metadata } = await response.json()

        if (url) {
          router.push(url)
        } else if (clientSecret) {
          // If clientSecret is returned, redirect to the checkout page with parameters
          const params = new URLSearchParams({
            payment_intent_client_secret: clientSecret,
            amount: amount.toString(),
            currency: currency,
            type: type,
            metadata: JSON.stringify(metadata || {}),
          }).toString()
          router.push(`/checkout?${params}`)
        } else {
          // Fallback if no URL or clientSecret, e.g., for free tiers or manual activation
          router.push("/signup/success")
        }
      } catch (checkoutError: any) {
        console.error("Checkout session creation error:", checkoutError)
        toast({
          title: "Payment Setup Error",
          description: checkoutError.message || "Could not set up payment. Please try again or contact support.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your email below to create your account</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSignUp} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="membershipTier">Membership Tier</Label>
            <Select value={membershipTier} onValueChange={setMembershipTier} required>
              <SelectTrigger id="membershipTier">
                <SelectValue placeholder="Select a tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frost_fan">Frost Fan ($9.99/month)</SelectItem>
                <SelectItem value="blizzard_vip">Blizzard VIP ($19.99/month)</SelectItem>
                <SelectItem value="avalanche_backstage">Avalanche Backstage ($49.99/month)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing Up...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" onClick={() => router.push("/login")} className="p-0 h-auto">
            Sign In
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}

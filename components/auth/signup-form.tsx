"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "./auth-provider"

const membershipTiers = {
  frost_fan: { name: "Frost Fan", price: 9.99 },
  blizzard_vip: { name: "Blizzard VIP", price: 19.99 },
  avalanche_backstage: { name: "Avalanche Backstage", price: 49.99 },
}

// Safe price formatting function
const formatPrice = (price: number | undefined | null): string => {
  if (typeof price !== "number" || isNaN(price)) {
    return "0.00"
  }
  return price.toFixed(2)
}

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string>("frost_fan")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Store signup data in session storage for checkout
      const signupData = {
        ...formData,
        tier: selectedTier,
      }
      sessionStorage.setItem("signup_data", JSON.stringify(signupData))

      // Create user account first
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        membership_tier: selectedTier,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Redirect to checkout with tier and email
      const checkoutUrl = `/checkout?tier=${selectedTier}&email=${encodeURIComponent(formData.email)}&signup=true`
      router.push(checkoutUrl)

      toast({
        title: "Account Created!",
        description: "Please complete your payment to activate your membership.",
      })
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTierData = membershipTiers[selectedTier as keyof typeof membershipTiers]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
            Join the Kelvin Creekman Fan Club
          </h1>
          <p className="text-muted-foreground">
            Choose your membership tier and get exclusive access to content, events, and more
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Membership Tiers */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Choose Your Membership</h2>

            {Object.entries(membershipTiers).map(([key, tier]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedTier === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedTier(key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${formatPrice(tier.price)}</div>
                      <div className="text-sm text-muted-foreground">/month</div>
                    </div>
                  </div>

                  {selectedTier === key && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">What's included:</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            Exclusive content access
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            Fan community access
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            Early music releases
                          </li>
                          {key !== "frost_fan" && (
                            <li className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              Priority event access
                            </li>
                          )}
                          {key === "avalanche_backstage" && (
                            <li className="flex items-center gap-2">
                              <Check className="h-3 w-3 text-green-500" />
                              Backstage meet & greet opportunities
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Signup Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your Account</CardTitle>
              <CardDescription>
                Selected: {selectedTierData?.name} - ${formatPrice(selectedTierData?.price)}/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    `Continue to Payment - $${formatPrice(selectedTierData?.price)}/month`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By signing up, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

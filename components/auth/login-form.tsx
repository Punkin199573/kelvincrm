"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "./auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      toast({
        title: "Login Error",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login to your account</CardTitle>
        <CardDescription>Enter your email and password below to login</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSignIn} className="grid gap-4">
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
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging In...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" onClick={() => router.push("/signup")} className="p-0 h-auto">
            Sign Up
          </Button>
        </p>
        <Button variant="link" onClick={() => router.push("/reset-password")} className="p-0 h-auto mt-2">
          Forgot password?
        </Button>
      </CardFooter>
    </Card>
  )
}

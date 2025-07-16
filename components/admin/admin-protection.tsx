"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface AdminProtectionProps {
  children: React.ReactNode
}

export function AdminProtection({ children }: AdminProtectionProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin")
        return
      }

      if (!profile?.is_admin) {
        setIsChecking(false)
        return
      }

      setIsChecking(false)
    }
  }, [user, profile, loading, router])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire-500 dark:border-ice-500 mb-4"></div>
            <p className="text-muted-foreground">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md border-fire-500/20 dark:border-ice-500/20">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-fire-500 dark:text-ice-500" />
            <CardTitle className="text-fire-600 dark:text-ice-400">Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-gradient-fire dark:bg-gradient-ice">
              <Link href="/login?redirect=/admin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-500/20">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
            <CardDescription>You don't have administrator privileges to access this area.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>Current user: {user.email}</p>
              <p>Admin status: {profile?.is_admin ? "Yes" : "No"}</p>
            </div>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-fire-500/10 to-electric-500/10 dark:from-ice-500/10 dark:to-electric-500/10 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4 text-gold-500" />
            <span className="font-medium text-gold-600 dark:text-gold-400">Admin Mode</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Welcome, {profile.full_name || user.email}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

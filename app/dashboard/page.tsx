"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"
import { UserDashboard } from "@/components/user-dashboard"
import { Loader2, User, Crown, Star, Zap, Settings, LogOut } from "lucide-react"

const tierIcons = {
  frost_fan: Star,
  blizzard_vip: Zap,
  avalanche_backstage: Crown,
}

const tierColors = {
  frost_fan: "bg-blue-500",
  blizzard_vip: "bg-purple-500",
  avalanche_backstage: "bg-yellow-500",
}

const tierNames = {
  frost_fan: "Frost Fan",
  blizzard_vip: "Blizzard VIP",
  avalanche_backstage: "Avalanche Backstage",
}

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.replace("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show login redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Redirecting to login...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const userTier = profile?.tier || "frost_fan"
  const TierIcon = tierIcons[userTier as keyof typeof tierIcons] || Star
  const tierColor = tierColors[userTier as keyof typeof tierColors] || "bg-blue-500"
  const tierName = tierNames[userTier as keyof typeof tierNames] || "Frost Fan"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!
            </h1>
            <p className="text-muted-foreground mt-1">Manage your membership and explore exclusive content</p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.full_name || user.email}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className={`p-2 rounded-full ${tierColor}`}>
                  <TierIcon className="h-4 w-4 text-white" />
                </div>
                <div className="text-right">
                  <Badge className="bg-primary text-primary-foreground">{tierName}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{profile?.subscription_status || "Active"}</p>
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Member Since</h4>
                <p className="text-lg font-bold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
                </p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Membership Tier</h4>
                <p className="text-lg font-bold">{tierName}</p>
              </div>

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                <p className="text-lg font-bold text-green-600">
                  {profile?.subscription_status === "active" ? "Active" : "Pending"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Main Dashboard Content */}
        <UserDashboard />
      </div>
    </div>
  )
}

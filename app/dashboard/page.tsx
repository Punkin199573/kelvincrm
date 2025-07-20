"use client"

import { useEffect } from "react"
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
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    await signOut()
    router.replace("/")
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Redirecting to login...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  const userTier = profile?.tier || "frost_fan"
  const TierIcon = tierIcons[userTier] || Star
  const tierColor = tierColors[userTier] || "bg-blue-500"
  const tierName = tierNames[userTier] || "Frost Fan"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {profile?.full_name || user?.email?.split("@")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mt-2">Your personalized dashboard awaits.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex items-center gap-2 flex-1 sm:flex-none bg-transparent">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 shadow-lg border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profile?.full_name || user?.email}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Badge className={`${tierColor} text-white px-3 py-1 rounded-full flex items-center gap-1`}>
                <TierIcon className="h-4 w-4" />
                {tierName}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base font-semibold truncate">{profile?.full_name || "N/A"}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base font-semibold truncate">{user?.email || "N/A"}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-base font-semibold capitalize">{profile?.subscription_status || "N/A"}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-base font-semibold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <p className="text-muted-foreground text-sm">Manage your profile and membership details in the settings.</p>
          </CardContent>
        </Card>

        {/* Main Dashboard Content */}
        <UserDashboard user={user} profile={profile} />
      </div>
    </div>
  )
}

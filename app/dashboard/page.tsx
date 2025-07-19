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
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Welcome, {profile?.full_name || user?.email?.split("@")[0] || "User"}!
            </h1>
            <p className="text-muted-foreground text-lg mt-2">Your personalized dashboard awaits.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Your Profile
            </CardTitle>
            <Badge className={`${tierColor} text-white px-3 py-1 rounded-full flex items-center gap-1`}>
              <TierIcon className="h-4 w-4" />
              {tierName}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-lg font-semibold">{profile?.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membership Status</p>
                <p className="text-lg font-semibold capitalize">{profile?.subscription_status || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-lg font-semibold">
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

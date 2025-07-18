"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Loader2, Crown, Star, Zap } from "lucide-react"

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
            <h1 className="\

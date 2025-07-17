"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Crown,
  Star,
  Zap,
  Calendar,
  ShoppingBag,
  Video,
  Music,
  Gift,
  Settings,
  LogOut,
  Mail,
  Phone,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

interface DashboardStats {
  totalOrders: number
  totalSpent: number
  upcomingEvents: number
  contentAccessed: number
  memberSince: string
}

const tierInfo = {
  frost_fan: {
    name: "Frost Fan",
    icon: Star,
    color: "bg-blue-500",
    nextTier: "blizzard_vip",
    benefits: ["Monthly exclusive content", "Fan community access", "Early music releases"],
  },
  blizzard_vip: {
    name: "Blizzard VIP",
    icon: Zap,
    color: "bg-purple-500",
    nextTier: "avalanche_backstage",
    benefits: ["Everything in Frost Fan", "Monthly video calls", "Exclusive merchandise discounts"],
  },
  avalanche_backstage: {
    name: "Avalanche Backstage",
    icon: Crown,
    color: "bg-yellow-500",
    nextTier: null,
    benefits: ["Everything in Blizzard VIP", "Weekly 1-on-1 video calls", "Signed merchandise"],
  },
}

export function UserDashboard() {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && profile) {
      fetchDashboardStats()
    }
  }, [user, profile])

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase.from("orders").select("total_amount, created_at").eq("user_id", user?.id)

      // Fetch event bookings
      const { data: events } = await supabase
        .from("event_bookings")
        .select("*")
        .eq("user_id", user?.id)
        .gte("event_date", new Date().toISOString())

      // Fetch session bookings
      const { data: sessions } = await supabase.from("session_bookings").select("*").eq("user_id", user?.id)

      const totalOrders = orders?.length || 0
      const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const upcomingEvents = (events?.length || 0) + (sessions?.length || 0)

      setStats({
        totalOrders,
        totalSpent,
        upcomingEvents,
        contentAccessed: Math.floor(Math.random() * 50) + 10, // Placeholder
        memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Unknown",
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentTier = tierInfo[profile.tier as keyof typeof tierInfo]
  const TierIcon = currentTier?.icon || User

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || ""} />
            <AvatarFallback className="text-lg">
              {profile.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Welcome back, {profile.full_name?.split(" ")[0] || "Fan"}!</h1>
            <p className="text-muted-foreground">Member since {stats?.memberSince}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`p-1 rounded-full ${currentTier?.color}`}>
                <TierIcon className="h-4 w-4 text-white" />
              </div>
              <Badge variant="secondary" className="capitalize">
                {currentTier?.name || profile.tier.replace("_", " ")}
              </Badge>
              <Badge
                variant={profile.subscription_status === "active" ? "default" : "destructive"}
                className="capitalize"
              >
                {profile.subscription_status}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `$${stats?.totalSpent.toFixed(2)}`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.upcomingEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Accessed</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.contentAccessed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Membership Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TierIcon className="h-5 w-5" />
                Your Membership
              </CardTitle>
              <CardDescription>
                {currentTier?.name} - {profile.subscription_status === "active" ? "Active" : "Inactive"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Your Benefits:</h4>
                <ul className="space-y-1">
                  {currentTier?.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {currentTier?.nextTier && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Upgrade to {tierInfo[currentTier.nextTier as keyof typeof tierInfo]?.name}:
                    </h4>
                    <Button asChild>
                      <Link href="/join">Upgrade Membership</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access your favorite features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/store">
                    <ShoppingBag className="h-6 w-6 mb-2" />
                    Shop Store
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/events">
                    <Calendar className="h-6 w-6 mb-2" />
                    View Events
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/meet-and-greet">
                    <Video className="h-6 w-6 mb-2" />
                    Book Session
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
                  <Link href="/content">
                    <Music className="h-6 w-6 mb-2" />
                    Exclusive Content
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Account Status</p>
                <Badge
                  variant={profile.subscription_status === "active" ? "default" : "destructive"}
                  className="capitalize"
                >
                  {profile.subscription_status}
                </Badge>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Last login</span>
                  <span className="text-muted-foreground">Today</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile updated</span>
                  <span className="text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Last purchase</span>
                  <span className="text-muted-foreground">1 week ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Crown, Calendar, ShoppingBag, Video, Star, Clock, Gift, TrendingUp, Heart, Users } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

interface UserStats {
  totalOrders: number
  totalSpent: number
  eventsAttended: number
  contentViewed: number
  memberSince: string
  nextTierProgress: number
}

interface RecentActivity {
  id: string
  type: "order" | "event" | "content" | "session"
  title: string
  date: string
  status?: string
}

export function UserDashboard() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    totalSpent: 0,
    eventsAttended: 0,
    contentViewed: 0,
    memberSince: "",
    nextTierProgress: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserStats()
      fetchRecentActivity()
    }
  }, [user])

  const fetchUserStats = async () => {
    if (!user) return

    try {
      // Fetch orders
      const { data: orders } = await supabase.from("orders").select("total_amount, created_at").eq("user_id", user.id)

      // Fetch event registrations
      const { data: events } = await supabase.from("event_registrations").select("*").eq("user_id", user.id)

      // Calculate stats
      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
      const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : "2024"

      // Calculate tier progress (simplified)
      let nextTierProgress = 0
      if (profile?.tier === "frost_fan") nextTierProgress = Math.min((totalSpent / 100) * 100, 100)
      else if (profile?.tier === "blizzard_vip") nextTierProgress = Math.min((totalSpent / 500) * 100, 100)

      setStats({
        totalOrders: orders?.length || 0,
        totalSpent,
        eventsAttended: events?.length || 0,
        contentViewed: 0, // This would need view tracking
        memberSince,
        nextTierProgress,
      })
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const fetchRecentActivity = async () => {
    if (!user) return

    try {
      // Fetch recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      // Fetch recent session bookings
      const { data: sessions } = await supabase
        .from("session_bookings")
        .select("id, session_type, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)

      const activity: RecentActivity[] = []

      orders?.forEach((order) => {
        activity.push({
          id: order.id,
          type: "order",
          title: `Order ${order.order_number}`,
          date: order.created_at,
          status: order.status,
        })
      })

      sessions?.forEach((session) => {
        activity.push({
          id: session.id,
          type: "session",
          title: `${session.session_type} Session`,
          date: session.created_at,
          status: session.status,
        })
      })

      // Sort by date
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activity.slice(0, 8))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case "avalanche_backstage":
        return { name: "Avalanche Backstage", color: "from-purple-500 to-pink-500", next: null }
      case "blizzard_vip":
        return { name: "Blizzard VIP", color: "from-blue-500 to-cyan-500", next: "Avalanche Backstage" }
      case "frost_fan":
      default:
        return { name: "Frost Fan", color: "from-gray-400 to-gray-600", next: "Blizzard VIP" }
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBag
      case "event":
        return Calendar
      case "content":
        return Star
      case "session":
        return Video
      default:
        return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-green-500/20 text-green-400"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400"
      case "confirmed":
        return "bg-blue-500/20 text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tierInfo = getTierInfo(profile?.tier || "frost_fan")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome back, {profile?.full_name || user?.email?.split("@")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Member since {stats.memberSince} • {tierInfo.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white border-0`}>
              <Crown className="h-3 w-3 mr-1" />
              {tierInfo.name}
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${stats.totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.eventsAttended}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Viewed</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.contentViewed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        {tierInfo.next && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress to {tierInfo.next}
              </CardTitle>
              <CardDescription>Keep engaging with the community to unlock the next tier!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(stats.nextTierProgress)}%</span>
                </div>
                <Progress value={stats.nextTierProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="activity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions with the fan club</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-3 border border-muted rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {activity.status && (
                            <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Start exploring to see your activity here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Track your merchandise orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Order Management</h3>
                  <p className="text-muted-foreground mb-4">View and track all your merchandise orders in one place.</p>
                  <Button asChild>
                    <Link href="/store">Browse Store</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>My Events</CardTitle>
                <CardDescription>Events you've registered for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Event Management</h3>
                  <p className="text-muted-foreground mb-4">
                    Keep track of upcoming events and your registration status.
                  </p>
                  <Button asChild>
                    <Link href="/events">View Events</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Exclusive Content</CardTitle>
                <CardDescription>Access your tier-based content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enjoy exclusive videos, audio, and behind-the-scenes content.
                  </p>
                  <Button asChild>
                    <Link href="/content">Explore Content</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Book a Session</h3>
              <p className="text-sm text-muted-foreground mb-4">Schedule a personal meet & greet</p>
              <Button asChild size="sm" className="w-full">
                <Link href="/meet-and-greet">Book Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Gift className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Exclusive Merch</h3>
              <p className="text-sm text-muted-foreground mb-4">Shop tier-exclusive merchandise</p>
              <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                <Link href="/store">Shop Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Join Community</h3>
              <p className="text-sm text-muted-foreground mb-4">Connect with other fans</p>
              <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                <Link href="/community">Explore</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

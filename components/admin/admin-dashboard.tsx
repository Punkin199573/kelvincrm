"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ShoppingBag, DollarSign, Crown, Settings, Video, Clock } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { AdminProductManagement } from "@/components/admin/admin-product-management"
import { AdminImageManagement } from "@/components/admin/admin-image-management"

interface LiveStats {
  totalMembers: number
  monthlyRevenue: number
  totalProducts: number
  totalOrders: number
  activeBookings: number
  ongoingSessions: number
}

interface RecentBooking {
  id: string
  user_email: string
  session_type: string
  amount_paid: number
  status: string
  created_at: string
}

interface ActiveSession {
  id: string
  user_email: string
  session_type: string
  joined_at: string
  is_admin: boolean
}

export function AdminDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<LiveStats>({
    totalMembers: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
    activeBookings: 0,
    ongoingSessions: 0,
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLiveData()

    // Set up real-time subscriptions
    const bookingsSubscription = supabase
      .channel("session_bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "session_bookings" }, () => {
        fetchLiveData()
      })
      .subscribe()

    const sessionsSubscription = supabase
      .channel("active_video_sessions")
      .on("postgres_changes", { event: "*", schema: "public", table: "active_video_sessions" }, () => {
        fetchActiveSessions()
      })
      .subscribe()

    return () => {
      bookingsSubscription.unsubscribe()
      sessionsSubscription.unsubscribe()
    }
  }, [])

  const fetchLiveData = async () => {
    try {
      setLoading(true)

      // Fetch member count
      const { count: memberCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Fetch product count
      const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true })

      // Fetch order count
      const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

      // Fetch active bookings count
      const { count: bookingCount } = await supabase
        .from("session_bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")

      // Calculate monthly revenue from session bookings
      const { data: monthlyBookings } = await supabase
        .from("session_bookings")
        .select("amount_paid")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      const monthlyRevenue = monthlyBookings?.reduce((sum, booking) => sum + Number(booking.amount_paid), 0) || 0

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from("session_bookings")
        .select(`
          id,
          session_type,
          amount_paid,
          status,
          created_at,
          profiles!inner(email)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      const formattedBookings =
        bookings?.map((booking) => ({
          id: booking.id,
          user_email: (booking.profiles as any).email,
          session_type: booking.session_type,
          amount_paid: booking.amount_paid,
          status: booking.status,
          created_at: booking.created_at,
        })) || []

      setStats({
        totalMembers: memberCount || 0,
        monthlyRevenue,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        activeBookings: bookingCount || 0,
        ongoingSessions: 0, // Will be updated by fetchActiveSessions
      })

      setRecentBookings(formattedBookings)
      await fetchActiveSessions()
    } catch (error) {
      console.error("Error fetching live data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveSessions = async () => {
    try {
      const { data: sessions } = await supabase
        .from("active_video_sessions")
        .select(`
          id,
          session_id,
          is_admin,
          joined_at,
          profiles!inner(email)
        `)
        .order("joined_at", { ascending: false })

      const formattedSessions =
        sessions?.map((session) => ({
          id: session.id,
          user_email: (session.profiles as any).email,
          session_type: session.session_id,
          joined_at: session.joined_at,
          is_admin: session.is_admin,
        })) || []

      setActiveSessions(formattedSessions)
      setStats((prev) => ({ ...prev, ongoingSessions: formattedSessions.length }))
    } catch (error) {
      console.error("Error fetching active sessions:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/20 text-green-400">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-500/20 text-blue-400">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent flex items-center gap-2">
              <Crown className="h-8 w-8 text-gold-500" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || profile?.email?.split("@")[0]}! Live data from your fan club.
            </p>
          </div>
          <Badge className="bg-gold-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>

        {/* Live Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fire-600 dark:text-ice-400">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">Active subscribers</p>
            </CardContent>
          </Card>

          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fire-600 dark:text-ice-400">
                ${stats.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fire-600 dark:text-ice-400">{stats.activeBookings}</div>
              <p className="text-xs text-muted-foreground">Confirmed sessions</p>
            </CardContent>
          </Card>

          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Sessions</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fire-600 dark:text-ice-400">{stats.ongoingSessions}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fire-600 dark:text-ice-400">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">In store</p>
            </CardContent>
          </Card>

          <Card className="border-fire-500/20 dark:border-ice-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fire-600 dark:text-ice-400">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Live Bookings</TabsTrigger>
            <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card className="border-fire-500/20 dark:border-ice-500/20">
                <CardHeader>
                  <CardTitle className="text-fire-600 dark:text-ice-400">Recent Session Bookings</CardTitle>
                  <CardDescription>Latest paid private sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.length > 0 ? (
                      recentBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 border border-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{booking.user_email}</p>
                            <p className="text-sm text-muted-foreground capitalize">{booking.session_type} session</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${booking.amount_paid}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No recent bookings</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card className="border-fire-500/20 dark:border-ice-500/20">
                <CardHeader>
                  <CardTitle className="text-fire-600 dark:text-ice-400">Active Video Sessions</CardTitle>
                  <CardDescription>Currently ongoing video calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeSessions.length > 0 ? (
                      activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 border border-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{session.user_email}</p>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(session.joined_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                              LIVE
                            </Badge>
                            {session.is_admin && (
                              <Badge className="ml-2 bg-gold-500/20 text-gold-400">
                                <Crown className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No active sessions</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card className="border-fire-500/20 dark:border-ice-500/20">
              <CardHeader>
                <CardTitle className="text-fire-600 dark:text-ice-400">Live Session Bookings</CardTitle>
                <CardDescription>Real-time view of all session bookings and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border border-muted rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-electric-500/20 rounded-full flex items-center justify-center">
                          <Video className="h-5 w-5 text-electric-400" />
                        </div>
                        <div>
                          <p className="font-medium">{booking.user_email}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {booking.session_type} session • {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-medium">${booking.amount_paid}</p>
                          <p className="text-sm text-muted-foreground">Paid</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card className="border-fire-500/20 dark:border-ice-500/20">
              <CardHeader>
                <CardTitle className="text-fire-600 dark:text-ice-400">Live Video Sessions</CardTitle>
                <CardDescription>Monitor all active video calls in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border border-green-500/30 bg-green-500/5 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Video className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium">{session.user_email}</p>
                            <p className="text-sm text-muted-foreground">
                              Session ID: {session.session_type} • Started{" "}
                              {new Date(session.joined_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {session.is_admin && (
                            <Badge className="bg-gold-500/20 text-gold-400">
                              <Crown className="h-3 w-3 mr-1" />
                              Host
                            </Badge>
                          )}
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                            LIVE
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active video sessions</p>
                      <p className="text-sm">Sessions will appear here when users join calls</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <AdminProductManagement />
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <AdminImageManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="border-fire-500/20 dark:border-ice-500/20">
              <CardHeader>
                <CardTitle className="text-fire-600 dark:text-ice-400">Admin Settings</CardTitle>
                <CardDescription>Configure your fan club settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Admin Settings</h3>
                  <p className="text-muted-foreground mb-4">
                    Configure payment settings, notification preferences, and other admin options.
                  </p>
                  <Button className="bg-gradient-fire dark:bg-gradient-ice">Open Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

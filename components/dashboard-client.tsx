"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Crown,
  Calendar,
  ShoppingBag,
  Video,
  Star,
  Clock,
  Gift,
  TrendingUp,
  Heart,
  Camera,
  Save,
  Loader2,
} from "lucide-react"
import { supabase, type Profile } from "@/lib/supabase/client"
import { toast } from "sonner"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import Link from "next/link"
import Image from "next/image"

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

interface DashboardClientProps {
  user: any
  profile: Profile
  initialStats: UserStats
}

export function DashboardClient({ user, profile: initialProfile, initialStats }: DashboardClientProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [stats] = useState<UserStats>(initialStats)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: initialProfile.full_name || "",
    phone: initialProfile.phone || "",
    avatar_url: initialProfile.avatar_url || "",
  })

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const [ordersResult, sessionsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id, order_number, created_at, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("session_bookings")
          .select("id, session_type, created_at, status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ])

      const activity: RecentActivity[] = []

      ordersResult.data?.forEach((order) => {
        activity.push({
          id: order.id,
          type: "order",
          title: `Order ${order.order_number}`,
          date: order.created_at,
          status: order.status,
        })
      })

      sessionsResult.data?.forEach((session) => {
        activity.push({
          id: session.id,
          type: "session",
          title: `${session.session_type} Session`,
          date: session.created_at,
          status: session.status,
        })
      })

      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activity.slice(0, 8))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          avatar_url: profileData.avatar_url,
        })
        .eq("id", user.id)

      if (error) throw error

      setProfile((prev) => ({
        ...prev,
        full_name: profileData.full_name,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
      }))

      toast.success("Profile updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
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

  const tierInfo = getTierInfo(profile.tier)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                {profileData.avatar_url ? (
                  <Image
                    src={profileData.avatar_url || "/placeholder.svg"}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome back, {profile.full_name || user.email?.split("@")[0]}!
              </h1>
              <p className="text-muted-foreground">
                Member since {stats.memberSince} • {tierInfo.name}
              </p>
            </div>
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
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                      {profileData.avatar_url ? (
                        <Image
                          src={profileData.avatar_url || "/placeholder.svg"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0">
                      <div className="bg-primary rounded-full p-2">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <UploadButton<OurFileRouter, "profileImageUploader">
                      endpoint="profileImageUploader"
                      onClientUploadComplete={(res) => {
                        if (res?.[0]) {
                          setProfileData((prev) => ({ ...prev, avatar_url: res[0].url }))
                          toast.success("Profile picture uploaded successfully")
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload Error: ${error.message}`)
                      }}
                      appearance={{
                        button: "bg-primary hover:bg-primary/90 text-primary-foreground text-sm px-4 py-2",
                        allowedContent: "text-muted-foreground text-xs",
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ""} disabled className="bg-muted" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tier">Membership Tier</Label>
                    <Input id="tier" value={tierInfo.name} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
              <Star className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold mb-2">Premium Content</h3>
              <p className="text-sm text-muted-foreground mb-4">Access exclusive content</p>
              <Button asChild size="sm" variant="outline" className="w-full bg-transparent">
                <Link href="/content">Explore</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

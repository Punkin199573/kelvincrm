"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Crown,
  Calendar,
  ShoppingBag,
  Heart,
  Star,
  Music,
  Video,
  Users,
  TrendingUp,
  Clock,
  Download,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import Link from "next/link"

export function UserDashboard() {
  const { user, profile } = useAuth()
  const [membershipProgress, setMembershipProgress] = useState(0)

  // Memoize tier info to prevent recalculations
  const tierInfo = useMemo(() => {
    const getTierInfo = (tier: string) => {
      switch (tier) {
        case "avalanche_backstage":
          return {
            name: "Avalanche Backstage",
            color: "from-yellow-500 to-orange-500",
            icon: Crown,
            benefits: ["Weekly 1-on-1 calls", "Signed merchandise", "Concert presales", "Personal requests"],
          }
        case "blizzard_vip":
          return {
            name: "Blizzard VIP",
            color: "from-purple-500 to-blue-500",
            icon: Star,
            benefits: ["Monthly video calls", "Exclusive discounts", "Behind-the-scenes", "Priority support"],
          }
        case "frost_fan":
        default:
          return {
            name: "Frost Fan",
            color: "from-blue-400 to-cyan-500",
            icon: Heart,
            benefits: ["Monthly content", "Community access", "Early releases", "Digital downloads"],
          }
      }
    }
    return getTierInfo(profile?.tier || "frost_fan")
  }, [profile?.tier])

  // Memoize static data to prevent unnecessary re-renders
  const staticData = useMemo(
    () => ({
      recentActivity: [
        { type: "content", title: "New song preview released", date: "2 days ago", icon: Music },
        { type: "event", title: "Virtual meet & greet booked", date: "1 week ago", icon: Video },
        { type: "purchase", title: "Limited edition t-shirt ordered", date: "2 weeks ago", icon: ShoppingBag },
      ],
      upcomingEvents: [
        { title: "Monthly Fan Q&A", date: "Dec 15, 2024", time: "7:00 PM EST", type: "Virtual" },
        { title: "Exclusive Listening Party", date: "Dec 22, 2024", time: "8:00 PM EST", type: "Virtual" },
      ],
      exclusiveContent: [
        { title: "Behind the Scenes: Studio Session", type: "Video", duration: "12:34", thumbnail: "/placeholder.svg" },
        { title: "Acoustic Version - Winter Dreams", type: "Audio", duration: "3:45", thumbnail: "/placeholder.svg" },
        { title: "Fan Letter Response #47", type: "Video", duration: "5:21", thumbnail: "/placeholder.svg" },
      ],
    }),
    [],
  )

  // Calculate membership progress only when profile changes
  useEffect(() => {
    if (profile?.created_at) {
      const createdDate = new Date(profile.created_at)
      const now = new Date()
      const daysSinceJoined = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
      const progress = Math.min((daysSinceJoined / 30) * 100, 100) // 30 days for full progress
      setMembershipProgress(progress)
    }
  }, [profile?.created_at])

  // Memoize user initials to prevent recalculation
  const userInitials = useMemo(() => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    }
    return user?.email?.[0].toUpperCase() || "U"
  }, [profile?.full_name, user?.email])

  const TierIcon = tierInfo.icon

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-user.jpg" alt={profile?.full_name || "User"} />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name || user?.email?.split("@")[0]}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white`}>
                <TierIcon className="h-3 w-3 mr-1" />
                {tierInfo.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Membership Status */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
                <TierIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tierInfo.name}</div>
                <p className="text-xs text-muted-foreground">Active subscription</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Membership Progress</span>
                    <span>{Math.round(membershipProgress)}%</span>
                  </div>
                  <Progress value={membershipProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Content Access */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Access</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Exclusive items available</p>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href="/content">Browse Content</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">Active members</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12% this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staticData.recentActivity.map((activity, index) => {
                  const ActivityIcon = activity.icon
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <ActivityIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Don't miss these exclusive events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staticData.upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.date} at {event.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/events">View All Events</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exclusive Content</CardTitle>
              <CardDescription>Content available to {tierInfo.name} members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {staticData.exclusiveContent.map((content, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {content.type === "Video" ? (
                        <Video className="h-6 w-6 text-muted-foreground" />
                      ) : (
                        <Music className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{content.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {content.type}
                        </Badge>
                        <Clock className="h-3 w-3" />
                        <span>{content.duration}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-4">
                <Link href="/content">Browse All Content</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events you can attend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staticData.upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date} at {event.time}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href="/events">View All Events</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meet & Greet</CardTitle>
                <CardDescription>Book personal sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Personal Sessions Available</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Book one-on-one video calls based on your membership tier
                  </p>
                  <Button asChild>
                    <Link href="/meet-and-greet">Book Session</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership Benefits</CardTitle>
              <CardDescription>What's included in your {tierInfo.name} membership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {tierInfo.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full mt-6">
                <Link href="/join">Upgrade Membership</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useMemo } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, ShoppingCart, Ticket, Users, ImageIcon, DollarSign, BarChart, Zap } from "lucide-react"
import type { Profile } from "./auth/auth-provider"

interface UserDashboardProps {
  user: User | null
  profile: Profile | null
}

export function UserDashboard({ user, profile }: UserDashboardProps) {
  const userInitials = useMemo(() => {
    if (profile?.full_name) {
      const names = profile.full_name.split(" ")
      return names
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return user?.email ? user.email[0]?.toUpperCase() : "U"
  }, [profile?.full_name, user?.email])

  const tierInfo = useMemo(() => {
    switch (profile?.tier) {
      case "frost_fan":
        return { name: "Frost Fan", description: "Access to exclusive content and early event notifications." }
      case "blizzard_vip":
        return { name: "Blizzard VIP", description: "All Frost Fan benefits plus VIP event access and discounts." }
      case "avalanche_backstage":
        return {
          name: "Avalanche Backstage",
          description: "All Blizzard VIP benefits plus meet & greets and private sessions.",
        }
      default:
        return { name: "Standard User", description: "Access to basic features and public content." }
    }
  }, [profile?.tier])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Membership Overview */}
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Membership Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
              {userInitials}
            </div>
            <div>
              <p className="text-lg font-semibold">{profile?.full_name || user?.email}</p>
              <p className="text-muted-foreground">{tierInfo.name}</p>
            </div>
          </div>
          <p className="text-muted-foreground">{tierInfo.description}</p>
          <Separator />
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">
              Status: <span className="font-semibold capitalize">{profile?.subscription_status || "N/A"}</span>
            </p>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center gap-1 bg-transparent"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs">Shop Now</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center gap-1 bg-transparent"
          >
            <Ticket className="h-5 w-5" />
            <span className="text-xs">My Tickets</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center gap-1 bg-transparent"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Upcoming Events</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 items-center justify-center gap-1 bg-transparent"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Community</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="lg:col-span-3 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-full">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Purchased "Limited Edition T-Shirt"</p>
                <p className="text-sm text-muted-foreground">2 days ago - Order #12345</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-full">
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Booked "Virtual Meet & Greet with Kelvin"</p>
                <p className="text-sm text-muted-foreground">5 days ago - Event on 2024-12-25</p>
              </div>
            </li>
            <li className="flex items-center gap-3">
              <div className="bg-muted p-2 rounded-full">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Accessed "Exclusive Photo Gallery"</p>
                <p className="text-sm text-muted-foreground">1 week ago</p>
              </div>
            </li>
          </ul>
          <Button variant="link" className="mt-4 px-0">
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

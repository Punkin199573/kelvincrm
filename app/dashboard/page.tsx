"use client"
import { createClient, getCurrentUser, getUserProfile } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard-client"
import { redirect } from "next/navigation"

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

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile(user.id)

  if (!profile) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Fetch user stats server-side
  const [ordersResult, eventsResult] = await Promise.all([
    supabase.from("orders").select("total_amount, created_at").eq("user_id", user.id),
    supabase.from("event_registrations").select("*").eq("user_id", user.id),
  ])

  const orders = ordersResult.data || []
  const events = eventsResult.data || []

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
    eventsAttended: events.length,
    contentViewed: 0,
    memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : "2024",
    nextTierProgress: 0,
  }

  // Calculate tier progress
  if (profile.tier === "frost_fan") {
    stats.nextTierProgress = Math.min((stats.totalSpent / 100) * 100, 100)
  } else if (profile.tier === "blizzard_vip") {
    stats.nextTierProgress = Math.min((stats.totalSpent / 500) * 100, 100)
  }

  return <DashboardClient user={user} profile={profile} initialStats={stats} />
}

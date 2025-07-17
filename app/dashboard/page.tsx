"use client"
import { UserDashboard } from "@/components/user-dashboard"

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

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserDashboard />
    </div>
  )
}

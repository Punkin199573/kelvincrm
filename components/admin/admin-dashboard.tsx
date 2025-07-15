"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, ShoppingBag, DollarSign, Crown, Settings, Plus, ImageIcon } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { AdminProductManagement } from "@/components/admin/admin-product-management"
import { AdminImageManagement } from "@/components/admin/admin-image-management"

export function AdminDashboard() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalMembers: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    totalOrders: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch member count
      const { count: memberCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Fetch product count
      const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true })

      // Fetch order count
      const { count: orderCount } = await supabase.from("orders").select("*", { count: "exact", head: true })

      // Calculate monthly revenue (mock for now)
      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      const monthlyRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

      setStats({
        totalMembers: memberCount || 0,
        monthlyRevenue,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
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
              Welcome back, {profile?.full_name || profile?.email?.split("@")[0]}! Here's what's happening with your fan
              club.
            </p>
          </div>
          <Badge className="bg-gold-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
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
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-fire-500/20 dark:border-ice-500/20">
                <CardHeader>
                  <CardTitle className="text-fire-600 dark:text-ice-400">Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setActiveTab("products")}
                    className="w-full justify-start bg-gradient-fire dark:bg-gradient-ice"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                  <Button onClick={() => setActiveTab("images")} variant="outline" className="w-full justify-start">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Manage Images
                  </Button>
                  <Button onClick={() => setActiveTab("members")} variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    View Members
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-fire-500/20 dark:border-ice-500/20">
                <CardHeader>
                  <CardTitle className="text-fire-600 dark:text-ice-400">Recent Activity</CardTitle>
                  <CardDescription>Latest system activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Activity feed coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card className="border-fire-500/20 dark:border-ice-500/20">
              <CardHeader>
                <CardTitle className="text-fire-600 dark:text-ice-400">Member Management</CardTitle>
                <CardDescription>Manage your fan club members and their subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Member Management</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage all your fan club members, their subscription tiers, and activity.
                  </p>
                  <Button className="bg-gradient-fire dark:bg-gradient-ice">View All Members</Button>
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

          <TabsContent value="orders" className="space-y-4">
            <Card className="border-fire-500/20 dark:border-ice-500/20">
              <CardHeader>
                <CardTitle className="text-fire-600 dark:text-ice-400">Order Management</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Order Management</h3>
                  <p className="text-muted-foreground mb-4">
                    View all customer orders, update order status, and manage fulfillment.
                  </p>
                  <Button className="bg-gradient-fire dark:bg-gradient-ice">View All Orders</Button>
                </div>
              </CardContent>
            </Card>
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

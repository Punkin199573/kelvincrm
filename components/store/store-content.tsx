"use client"

import { useEffect, useState } from "react"
import { supabase, type Product } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { StoreHeader } from "@/components/store/store-header"
import { ProductGrid } from "@/components/store/product-grid"
import { StoreBanner } from "@/components/store/store-banner"
import { Loader2 } from "lucide-react"

export function StoreContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [profile])

  const fetchProducts = async () => {
    try {
      const query = supabase.from("products").select("*").eq("in_stock", true).order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Filter products based on user tier
      const userTier = profile?.tier || "street_rep"
      const filteredProducts = data.filter((product) => product.tier_visibility.includes(userTier))

      setProducts(filteredProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container py-8 space-y-8">
        <StoreHeader />
        <StoreBanner />
        <ProductGrid products={products} />
      </div>
    </div>
  )
}

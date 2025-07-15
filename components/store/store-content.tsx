"use client"

import { useEffect, useState } from "react"
import { supabase, type Product } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-provider"
import { ProductGrid } from "@/components/store/product-grid"
import { Loader2 } from "lucide-react"

export function StoreContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    fetchProducts()

    // Set up real-time subscription for product updates
    const subscription = supabase
      .channel("products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const query = supabase.from("products").select("*").eq("in_stock", true).order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Filter products based on user tier
      const userTier = profile?.tier || "frost_fan"
      const filteredProducts = data?.filter((product) => product.tier_visibility.includes(userTier)) || []

      setProducts(filteredProducts)
    } catch (error: any) {
      console.error("Error fetching products:", error)
      setError(error.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-fire-500 dark:text-ice-400" />
          <p className="text-muted-foreground">Loading exclusive merchandise...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-semibold">Failed to load products</div>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-fire-500 dark:bg-ice-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return <ProductGrid products={products} />
}

"use client"

import { useState, useEffect } from "react"
import { ProductGrid } from "./product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/lib/supabase/client"

interface StoreContentProps {
  products: Product[]
}

export function StoreContent({ products: initialProducts }: StoreContentProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<string>("all")
  const [showExclusiveOnly, setShowExclusiveOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user, profile } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [user, profile])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, priceRange, showExclusiveOnly, profile])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const query = supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Filter products based on user tier
      let visibleProducts = data || []

      if (profile?.tier) {
        const tierHierarchy = {
          frost_fan: ["frost_fan"],
          blizzard_vip: ["frost_fan", "blizzard_vip"],
          avalanche_backstage: ["frost_fan", "blizzard_vip", "avalanche_backstage"],
        }

        const userTiers = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || ["frost_fan"]

        visibleProducts = visibleProducts.filter((product) => {
          // If tier_visibility is empty, show to all users
          if (!product.tier_visibility || product.tier_visibility.length === 0) {
            return true
          }
          // Check if user's tier allows access to this product
          return product.tier_visibility.some((tier) => userTiers.includes(tier))
        })
      }

      setProducts(visibleProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-25":
          filtered = filtered.filter((product) => product.price < 25)
          break
        case "25-50":
          filtered = filtered.filter((product) => product.price >= 25 && product.price <= 50)
          break
        case "over-50":
          filtered = filtered.filter((product) => product.price > 50)
          break
      }
    }

    // Exclusive filter
    if (showExclusiveOnly) {
      filtered = filtered.filter((product) => product.is_exclusive)
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setPriceRange("all")
    setShowExclusiveOnly(false)
  }

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "music", label: "Music" },
    { value: "collectibles", label: "Collectibles" },
  ]

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "under-25", label: "Under $25" },
    { value: "25-50", label: "$25 - $50" },
    { value: "over-50", label: "Over $50" },
  ]

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all" ? selectedCategory : null,
    priceRange !== "all" ? priceRange : null,
    showExclusiveOnly ? "exclusive" : null,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </h3>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Exclusive Toggle */}
          <Button
            variant={showExclusiveOnly ? "default" : "outline"}
            onClick={() => setShowExclusiveOnly(!showExclusiveOnly)}
            className="justify-start"
          >
            Exclusive Only
            {showExclusiveOnly && (
              <Badge className="ml-2" variant="secondary">
                On
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {loading
            ? "Loading..."
            : `${filteredProducts.length} product${filteredProducts.length !== 1 ? "s" : ""} found`}
        </p>

        {profile && (
          <Badge variant="outline" className="capitalize">
            {profile.tier.replace("_", " ")} Member
          </Badge>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid products={filteredProducts} loading={loading} />
    </div>
  )
}

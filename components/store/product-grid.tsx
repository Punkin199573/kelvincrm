"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/components/store/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Star, Package } from "lucide-react"
import type { Product } from "@/lib/supabase/client"

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({})
  const [selectedColors, setSelectedColors] = useState<{ [key: string]: string }>({})
  const { addItem } = useCart()
  const { toast } = useToast()

  const categories = [
    { value: "all", label: "All Products" },
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "music", label: "Music" },
    { value: "collectibles", label: "Collectibles" },
  ]

  const filteredProducts = products.filter(
    (product) => selectedCategory === "all" || product.category === selectedCategory,
  )

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id]
    const selectedColor = selectedColors[product.id]

    // Validate size selection for apparel
    if (product.category === "apparel" && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Size Required",
        description: "Please select a size before adding to cart.",
        variant: "destructive",
      })
      return
    }

    // Validate color selection if multiple colors available
    if (product.colors.length > 1 && !selectedColor) {
      toast({
        title: "Color Required",
        description: "Please select a color before adding to cart.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: `${product.id}-${selectedSize || "default"}-${selectedColor || "default"}`,
      name: product.name,
      price: product.price,
      image: product.image_url,
      size: selectedSize,
      color: selectedColor || product.colors[0],
    })

    toast({
      title: "Added to cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }))
  }

  const handleColorChange = (productId: string, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }))
  }

  const getTierBadge = (product: Product) => {
    if (!product.is_exclusive) return null

    return (
      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-gold-400 to-gold-600 text-white border-0">
        <Star className="h-3 w-3 mr-1" />
        Exclusive
      </Badge>
    )
  }

  const getStockBadge = (product: Product) => {
    if (!product.in_stock) {
      return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Badge variant="destructive" className="text-sm">
            Out of Stock
          </Badge>
        </div>
      )
    }
    return null
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          {selectedCategory === "all"
            ? "No products are currently available."
            : `No products found in the ${selectedCategory} category.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.value)}
            className={selectedCategory === category.value ? "bg-gradient-fire dark:bg-gradient-ice" : ""}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="group border-fire-500/20 dark:border-ice-500/20 hover:border-fire-500/40 dark:hover:border-ice-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-fire-500/10 dark:hover:shadow-ice-500/10 overflow-hidden"
          >
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {getTierBadge(product)}
                {getStockBadge(product)}

                {/* Exclusive shimmer effect */}
                {product.is_exclusive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <CardTitle className="text-lg group-hover:text-fire-600 dark:group-hover:text-ice-400 transition-colors line-clamp-1">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-fire-600 dark:text-ice-400">${product.price.toFixed(2)}</span>
                <Badge variant="outline" className="capitalize text-xs">
                  {product.category}
                </Badge>
              </div>

              {/* Size Selection */}
              {product.category === "apparel" && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size:</label>
                  <Select
                    value={selectedSizes[product.id] || ""}
                    onValueChange={(value) => handleSizeChange(product.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {product.colors.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color:</label>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(product.id, color)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedColors[product.id] === color
                            ? "bg-fire-500 dark:bg-ice-500 text-white border-fire-500 dark:border-ice-500"
                            : "bg-background border-muted-foreground/20 hover:border-fire-500/50 dark:hover:border-ice-500/50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                onClick={() => handleAddToCart(product)}
                disabled={!product.in_stock}
                className="w-full bg-gradient-fire dark:bg-gradient-ice hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {product.in_stock ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Out of Stock
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

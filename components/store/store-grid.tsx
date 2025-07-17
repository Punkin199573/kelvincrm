"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, AlertCircle } from "lucide-react"
import { useCart } from "@/components/store/cart-context"
import { useToast } from "@/hooks/use-toast"
import { StoreHeader } from "./store-header"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
  isExclusive: boolean
}

interface StoreGridProps {
  products: Product[]
}

export function StoreGrid({ products }: StoreGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { addItem } = useCart()
  const { toast } = useToast()

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="space-y-8">
      <StoreHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalProducts={products.length}
      />

      {/* Products Grid */}
      <div
        className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={`group hover:shadow-lg transition-all duration-300 ${
              !product.inStock ? "opacity-75" : ""
            } ${viewMode === "list" ? "flex flex-row" : ""}`}
          >
            <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
              <div className={`relative overflow-hidden ${viewMode === "list" ? "h-full" : "aspect-square"}`}>
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.isExclusive && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Exclusive
                  </Badge>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className={`flex flex-col ${viewMode === "list" ? "flex-1" : ""}`}>
              <CardHeader className={viewMode === "list" ? "pb-2" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className={`flex-1 ${viewMode === "list" ? "py-2" : ""}`}>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </CardContent>

              <CardFooter className={viewMode === "list" ? "pt-2" : ""}>
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className="w-full gap-2"
                  variant={product.inStock ? "default" : "secondary"}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
          <Button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("all")
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

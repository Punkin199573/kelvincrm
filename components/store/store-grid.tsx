"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Crown, Filter, Grid, List } from "lucide-react"

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { toast } = useToast()

  const categories = [
    { value: "all", label: "All Items" },
    { value: "apparel", label: "Apparel" },
    { value: "accessories", label: "Accessories" },
    { value: "music", label: "Music" },
  ]

  const filteredProducts = products.filter(
    (product) => selectedCategory === "all" || product.category === selectedCategory,
  )

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return

    toast({
      title: "Added to cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
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
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Products */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} viewMode={viewMode} onAddToCart={handleAddToCart} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try selecting a different category to see more items.</p>
        </div>
      )}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  viewMode: "grid" | "list"
  onAddToCart: (product: Product) => void
}

function ProductCard({ product, viewMode, onAddToCart }: ProductCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <div className="flex">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded-l-lg"
              sizes="128px"
            />
            {product.isExclusive && (
              <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                <Crown className="h-3 w-3 mr-1" />
                Exclusive
              </Badge>
            )}
          </div>

          <div className="flex-1 p-6 flex justify-between">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
                {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
              </div>
            </div>

            <div className="flex flex-col items-end justify-between">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              <Button onClick={() => onAddToCart(product)} disabled={!product.inStock} className="mt-4">
                {product.inStock ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                ) : (
                  "Out of Stock"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isExclusive && (
              <Badge className="bg-yellow-500 text-yellow-900">
                <Crown className="h-3 w-3 mr-1" />
                Exclusive
              </Badge>
            )}
          </div>

          {/* Stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
          <Badge variant="outline" className="capitalize">
            {product.category}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onAddToCart(product)} disabled={!product.inStock} className="w-full">
          {product.inStock ? (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          ) : (
            "Out of Stock"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

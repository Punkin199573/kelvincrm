"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "./cart-context"
import { ShoppingCart, Star, Crown, Loader2 } from "lucide-react"
import type { Product } from "@/lib/supabase/client"

interface ProductGridProps {
  products: Product[]
  loading?: boolean
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleAddToCart = async (product: Product, selectedSize?: string, selectedColor?: string) => {
    setAddingToCart(product.id)

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || "/placeholder.svg",
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-0">
              <div className="aspect-square bg-muted rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="h-10 bg-muted rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          isAddingToCart={addingToCart === product.id}
        />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, size?: string, color?: string) => void
  isAddingToCart: boolean
}

function ProductCard({ product, onAddToCart, isAddingToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")

  const needsSize = product.sizes && product.sizes.length > 0
  const needsColor = product.colors && product.colors.length > 0
  const canAddToCart = (!needsSize || selectedSize) && (!needsColor || selectedColor)

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_exclusive && (
              <Badge className="bg-yellow-500 text-yellow-900">
                <Crown className="h-3 w-3 mr-1" />
                Exclusive
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-blue-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Stock indicator */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive">Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
          <Badge variant="outline" className="capitalize">
            {product.category}
          </Badge>
        </div>

        {/* Size Selection */}
        {needsSize && (
          <div className="mb-3">
            <label className="text-sm font-medium mb-1 block">Size</label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
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
        {needsColor && (
          <div className="mb-3">
            <label className="text-sm font-medium mb-1 block">Color</label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {product.colors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product, selectedSize, selectedColor)}
          disabled={!product.in_stock || !canAddToCart || isAddingToCart}
          className="w-full"
        >
          {isAddingToCart ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : !product.in_stock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

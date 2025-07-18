"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "./cart-context"
import { ShoppingCart, Crown, Loader2 } from "lucide-react"

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
  const { addItem } = useCart()
  const { toast } = useToast()
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product.id)

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
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

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No products available</h3>
        <p className="text-muted-foreground">Check back soon for new merchandise!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="p-0">
            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isExclusive && (
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Crown className="h-3 w-3 mr-1" />
                    Exclusive
                  </Badge>
                )}
              </div>

              {/* Stock indicator */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
              <Badge variant="outline" className="capitalize">
                {product.category}
              </Badge>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={!product.inStock || addingToCart === product.id}
              className="w-full"
            >
              {addingToCart === product.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : !product.inStock ? (
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
      ))}
    </div>
  )
}

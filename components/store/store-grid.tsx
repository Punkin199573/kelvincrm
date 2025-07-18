"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/store/cart-context"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Star } from "lucide-react"

const products = [
  {
    id: "1",
    name: "Kelvin Creekman T-Shirt",
    description:
      "Premium cotton t-shirt with exclusive Kelvin Creekman design. Comfortable fit and high-quality print.",
    price: 29.99,
    image: "/store/product1.png",
    category: "Apparel",
    featured: true,
  },
  {
    id: "2",
    name: "Signature Coffee Mug",
    description: "Start your morning right with this ceramic mug featuring Kelvin's signature. Dishwasher safe.",
    price: 19.99,
    image: "/store/product2.png",
    category: "Accessories",
    featured: false,
  },
  {
    id: "3",
    name: "Limited Edition Poster",
    description: "High-quality print poster from Kelvin's latest album. Perfect for any fan's wall collection.",
    price: 24.99,
    image: "/store/product3.png",
    category: "Collectibles",
    featured: true,
  },
  {
    id: "4",
    name: "Kelvin Creekman Hoodie",
    description: "Cozy fleece hoodie with embroidered logo. Perfect for concerts or casual wear.",
    price: 49.99,
    image: "/store/product4.png",
    category: "Apparel",
    featured: false,
  },
  {
    id: "5",
    name: "Autographed Photo",
    description: "Personally signed 8x10 photo by Kelvin Creekman. Comes with certificate of authenticity.",
    price: 39.99,
    image: "/store/product5.png",
    category: "Collectibles",
    featured: true,
  },
  {
    id: "6",
    name: "Fan Club Pin Set",
    description: "Exclusive set of 3 enamel pins featuring iconic Kelvin Creekman symbols and logos.",
    price: 14.99,
    image: "/store/product6.png",
    category: "Accessories",
    featured: false,
  },
]

export function StoreGrid() {
  const [filter, setFilter] = useState("all")
  const { addItem } = useCart()
  const { toast } = useToast()

  const filteredProducts = products.filter((product) => {
    if (filter === "all") return true
    if (filter === "featured") return product.featured
    return product.category.toLowerCase() === filter.toLowerCase()
  })

  const handleAddToCart = (product: (typeof products)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const categories = ["all", "featured", "apparel", "accessories", "collectibles"]

  return (
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? "default" : "outline"}
            onClick={() => setFilter(category)}
            className="capitalize"
          >
            {category === "all" ? "All Products" : category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                <Badge variant="secondary" className="ml-2 flex-shrink-0">
                  {product.category}
                </Badge>
              </div>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{product.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">${product.price}</span>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button className="w-full" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}

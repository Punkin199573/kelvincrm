import type { Metadata } from "next"
import { StoreHeader } from "@/components/store/store-header"
import { StoreGrid } from "@/components/store/store-grid"

export const metadata: Metadata = {
  title: "Merchandise Store | Kelvin Creekman Fan Club",
  description: "Official Kelvin Creekman merchandise and exclusive fan club items",
}

// Mock products using static images
const products = [
  {
    id: "1",
    name: "Kelvin Creekman Signature T-Shirt",
    description: "Premium cotton t-shirt with exclusive Kelvin Creekman design",
    price: 29.99,
    image: "/store/product1.png",
    category: "apparel",
    inStock: true,
    isExclusive: false,
  },
  {
    id: "2",
    name: "Sacred Geometry Hoodie",
    description: "Comfortable hoodie featuring the iconic sacred geometry artwork",
    price: 59.99,
    image: "/store/product2.png",
    category: "apparel",
    inStock: true,
    isExclusive: true,
  },
  {
    id: "3",
    name: "Kelvin's Coffee Mug",
    description: "15oz ceramic mug perfect for your morning coffee ritual",
    price: 18.99,
    image: "/store/product3.png",
    category: "accessories",
    inStock: true,
    isExclusive: false,
  },
  {
    id: "4",
    name: "Limited Edition Vinyl Record",
    description: "Exclusive vinyl pressing of Kelvin's latest album",
    price: 34.99,
    image: "/store/product4.png",
    category: "music",
    inStock: true,
    isExclusive: true,
  },
  {
    id: "5",
    name: "Meditation Beanie",
    description: "Soft knit beanie for your spiritual journey",
    price: 24.99,
    image: "/store/product5.png",
    category: "apparel",
    inStock: true,
    isExclusive: false,
  },
  {
    id: "6",
    name: "Wisdom Journal",
    description: "Premium leather-bound journal for your thoughts and reflections",
    price: 39.99,
    image: "/store/product6.png",
    category: "accessories",
    inStock: false,
    isExclusive: true,
  },
]

export default function StorePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <StoreHeader />
        <StoreGrid products={products} />
      </div>
    </div>
  )
}

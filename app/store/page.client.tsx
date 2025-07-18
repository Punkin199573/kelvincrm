"use client"

import { StoreGrid } from "@/components/store/store-grid"
import { CartProvider } from "@/components/store/cart-context"

// Updated products using the uploaded images
const products = [
  {
    id: "1",
    name: "Kelvin Portrait V-Neck Tee",
    description: "Premium v-neck t-shirt featuring Kelvin's iconic portrait with red accent",
    price: 34.99,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product3.png-BJKjgm5SuBpZyZOCGpBRWZxggKQXPl.webp",
    category: "apparel",
    inStock: true,
    isExclusive: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "2",
    name: "Creekman Retro Sunset Tee",
    description: "Vintage-inspired t-shirt with the iconic Creekman sunset logo",
    price: 29.99,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled_design_-_2025-06-17T020939.494-JOMukIMjUZQ2kTmUl1hCu0kHgvcQUL.webp",
    category: "apparel",
    inStock: true,
    isExclusive: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy", "Black"],
  },
  {
    id: "3",
    name: "Creekman Logo Baseball Cap",
    description: "Distressed black baseball cap with embroidered Creekman logo",
    price: 24.99,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/distressed-dad-hat-black-front-6560475bdb80e_fe105eec-b0d5-452e-8867-cd3a13c0bdae-w6pSANSAtVFKaWfXi2PCYM6W58yJG1.webp",
    category: "accessories",
    inStock: true,
    isExclusive: false,
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "4",
    name: "Creekman Sunset Coffee Mug",
    description: "15oz ceramic mug featuring the retro Creekman sunset design",
    price: 18.99,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Context_1_1-sz2u6rUxrlD3NpXIYpHeiQaMOrQz2w.webp",
    category: "accessories",
    inStock: true,
    isExclusive: false,
    colors: ["Black"],
  },
  {
    id: "5",
    name: "Sacred Geometry Travel Tumbler",
    description: "20oz insulated travel tumbler with sacred geometry flower of life design",
    price: 32.99,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TEST_HANDLED_TUMBLER_20oz_Travel_Tumbler_Navy_Mockup_png_98f906a0-6d1d-456e-983c-5bc0d9255ead-SJdYdwJ6VCMyLgU2293VPqk0RVZhuM.webp",
    category: "accessories",
    inStock: true,
    isExclusive: true,
    colors: ["Navy"],
  },
  {
    id: "6",
    name: "Sacred Geometry Pin",
    description: "Collectible pin featuring the sacred geometry flower of life pattern",
    price: 12.99,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pinondenim%20%281%29-gqRsxjZOVJ6YB7txYxwJ1uaE3h9PPg.webp",
    category: "collectibles",
    inStock: true,
    isExclusive: false,
    colors: ["Black & White"],
  },
  {
    id: "7",
    name: "Creekman Back Print Tee",
    description: "Navy t-shirt with Creekman sunset logo printed on the back",
    price: 31.99,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product4.png-pBij6OeHU7ulO4fdVGk6VAO0DnG4Zr.webp",
    category: "apparel",
    inStock: true,
    isExclusive: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy"],
  },
  {
    id: "8",
    name: "Creekman Classic Tee",
    description: "Essential black t-shirt with clean white Creekman logo",
    price: 26.99,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product1.png-umb0MWNxW1xkra4kCOOxT1qvZcU9PJ.webp",
    category: "apparel",
    inStock: true,
    isExclusive: false,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "9",
    name: "Kelvin Portrait Tank Top",
    description: "Racerback tank top featuring Kelvin's portrait with red branding",
    price: 28.99,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3373267483764888693_2048_98d76d88-6c48-44d3-ae5f-cf960f7afdde-gbXMNXoc59ks7Z953JEIZJWIXH1Pwp.webp",
    category: "apparel",
    inStock: true,
    isExclusive: true,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Dark Gray"],
  },
  {
    id: "10",
    name: "Sacred Geometry Mug",
    description: "15oz black ceramic mug with white sacred geometry design",
    price: 19.99,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/whitemug%20%283%29-TCiUEmQzKHO26x65mhD5pWpSS0FUJz.webp",
    category: "accessories",
    inStock: true,
    isExclusive: false,
    colors: ["Black"],
  },
]

export default function StorePageClient() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Official Merchandise Store</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get exclusive Kelvin Creekman merchandise and show your support with premium quality items.
            </p>
          </div>
          <StoreGrid products={products} />
        </div>
      </div>
    </CartProvider>
  )
}

"use client"

import { ShoppingBag, Star } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export function StoreHeader() {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Official Store
            </h1>
            <p className="text-muted-foreground mt-1">Exclusive Kelvin Creekman merchandise and collectibles</p>
          </div>
        </div>
        <ModeToggle />
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-primary">Exclusive Collection</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover unique items crafted specifically for the Kelvin Creekman community. Each piece tells a story and
          connects you to the journey.
        </p>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/store/cart-context"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, Store, Video, User } from "lucide-react"

const footerNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Store", href: "/store", icon: Store },
  { name: "Meet", href: "/meet-and-greet", icon: Video },
  { name: "Profile", href: "/dashboard", icon: User },
]

export function MobileFooterNav() {
  const pathname = usePathname()
  const { state } = useCart()

  // Safely calculate cart item count
  const cartItemCount = state?.items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur-lg border-t border-electric-700/30 px-4 py-2">
        <nav className="flex items-center justify-around">
          {footerNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const isStore = item.href === "/store"

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative",
                  isActive ? "text-electric-400" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {isStore && cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs bg-electric-500 text-white">
                      {cartItemCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-electric-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

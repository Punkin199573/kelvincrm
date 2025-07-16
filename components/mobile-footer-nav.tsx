"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Store, Video, User } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const footerNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Store", href: "/store", icon: Store },
  { name: "Meet", href: "/meet-and-greet", icon: Video },
  { name: "Profile", href: "/dashboard", icon: User },
]

export function MobileFooterNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <nav className="flex items-center justify-around px-2 py-2">
        {footerNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          // Don't show profile link if user is not logged in
          if (item.href === "/dashboard" && !user) {
            return (
              <Link
                key={item.name}
                href="/login"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
                Login
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive ? "text-fire-600 dark:text-ice-400" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

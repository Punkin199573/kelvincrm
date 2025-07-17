"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Menu,
  Home,
  Calendar,
  Store,
  Video,
  Users,
  Music,
  Crown,
  User,
  LogIn,
  UserPlus,
  Settings,
  ShoppingCart,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/store/cart-context"
import { ModeToggle } from "@/components/mode-toggle"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Content", href: "/content", icon: Music },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Store", href: "/store", icon: Store },
  { name: "Meet & Greet", href: "/meet-and-greet", icon: Video },
  { name: "Community", href: "/community", icon: Users },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { state } = useCart()

  const handleLinkClick = () => {
    setOpen(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Safely calculate cart item count
  const cartItemCount = state?.items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-lg border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:text-electric-400 transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0 bg-background/95 backdrop-blur-lg border-electric-700/30">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-electric-700/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/kelvin-logo.png"
                  alt="Kelvin Creekman"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-electric-500/50 shadow-lg shadow-electric-500/20"
                />
                <div>
                  <SheetTitle className="text-left text-lg font-bold bg-gradient-to-r from-electric-400 to-frost-400 bg-clip-text text-transparent">
                    Kelvin Creekman
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">Fan Club</p>
                </div>
              </div>
              <ModeToggle />
            </div>
          </SheetHeader>

          {/* User Section */}
          {user && profile && (
            <div className="p-6 pb-4 border-b border-electric-700/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-400 to-frost-400 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{profile.full_name || "Fan"}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {profile.membership_tier && (
                  <Badge className="bg-gold-500/20 text-gold-600 border-gold-500/30">
                    <Crown className="h-3 w-3 mr-1" />
                    {profile.membership_tier}
                  </Badge>
                )}

                {profile.is_admin && (
                  <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">
                    <Settings className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-electric-500/10 text-electric-600 dark:bg-ice-500/10 dark:text-ice-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}

            <Separator className="my-4" />

            {/* Cart */}
            <Link
              href="/store"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cartItemCount > 0 && <Badge className="ml-auto bg-electric-500 text-white">{cartItemCount}</Badge>}
            </Link>

            {/* User-specific Links */}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/dashboard"
                      ? "bg-electric-500/10 text-electric-600 dark:bg-ice-500/10 dark:text-ice-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <User className="h-5 w-5" />
                  My Dashboard
                </Link>

                {profile?.is_admin && (
                  <Link
                    href="/admin"
                    onClick={handleLinkClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      pathname === "/admin"
                        ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Crown className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="p-6 pt-4 border-t border-electric-700/20 space-y-3">
            {user ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full justify-start bg-transparent hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-electric-400 to-frost-400 hover:from-electric-500 hover:to-frost-500"
                >
                  <Link href="/login" onClick={handleLinkClick}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/signup" onClick={handleLinkClick}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

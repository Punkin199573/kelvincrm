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
import { Menu, Home, Calendar, Store, Video, User, LogIn, UserPlus, ShoppingCart, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/store/cart-context"
import { ModeToggle } from "@/components/mode-toggle"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Store", href: "/store", icon: Store },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Meet & Greet", href: "/meet-and-greet", icon: Video },
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
          className="h-10 w-10 rounded-lg border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hover:text-primary transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0 bg-background/95 backdrop-blur-lg border-border/30">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/kelvin-logo.png"
                  alt="Kelvin Creekman"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-primary/50 shadow-lg shadow-primary/20"
                />
                <div>
                  <SheetTitle className="text-left text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
            <div className="p-6 pb-4 border-b border-border/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{profile.full_name || "Fan"}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {profile.tier && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {profile.tier.replace("_", " ")}
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
                      ? "bg-primary/10 text-primary"
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
              href="/cart"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cartItemCount > 0 && <Badge className="ml-auto bg-primary text-white">{cartItemCount}</Badge>}
            </Link>

            {/* User-specific Links */}
            {user && (
              <Link
                href="/dashboard"
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <User className="h-5 w-5" />
                My Dashboard
              </Link>
            )}
          </nav>

          {/* Footer Actions */}
          <div className="p-6 pt-4 border-t border-border/20 space-y-3">
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
                  className="w-full bg-gradient-to-r from-primary to-primary/60 hover:from-primary/90 hover:to-primary/50"
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

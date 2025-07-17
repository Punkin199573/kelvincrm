"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/store/cart-context"
import { ShoppingCart, User, LogOut, Settings, Crown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/content", label: "Content" },
  { href: "/events", label: "Events" },
  { href: "/store", label: "Store" },
  { href: "/meet-and-greet", label: "Meet & Greet" },
]

export function MainNav() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { state } = useCart()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Safely calculate cart item count
  const cartItemCount = state?.items?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile Navigation - Left Side */}
        <div className="flex items-center md:hidden">
          <MobileNav />
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <Link href="/" className="flex items-center space-x-3 md:mr-6">
          <div className="relative group">
            <Image
              src="/kelvin-logo.png"
              alt="Kelvin Creekman Logo"
              width={40}
              height={40}
              className="rounded-full border-2 border-electric-500/50 shadow-lg shadow-electric-500/20 transition-all duration-300 group-hover:border-electric-400 group-hover:shadow-electric-400/30"
              priority
            />
            <div className="absolute inset-0 rounded-full border-2 border-electric-500/30 animate-pulse group-hover:border-electric-400/50" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-electric-400 to-frost-400 bg-clip-text text-transparent leading-tight">
              Kelvin Creekman
            </span>
            <span className="text-xs text-muted-foreground/70 font-medium tracking-wider uppercase">
              Official Fan Club
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-electric-400 relative group py-2",
                pathname === item.href ? "text-electric-400 frost-text" : "text-muted-foreground",
              )}
            >
              {item.label}
              {pathname === item.href && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-electric-400 to-frost-400 rounded-full" />
              )}
              <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-electric-400 to-frost-400 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Cart Button */}
          <Button asChild variant="ghost" size="sm" className="relative hover:text-electric-400 transition-colors">
            <Link href="/store">
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-electric-500 text-white animate-pulse">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Theme Toggle - Desktop Only */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* User Menu - Desktop */}
          {user && profile ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:text-electric-400 transition-colors">
                    <User className="h-4 w-4 mr-2" />
                    <span className="max-w-24 truncate">{profile.full_name || user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border-electric-700/30 bg-background/95 backdrop-blur-lg"
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile.full_name || "Fan"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  {profile.membership_tier && (
                    <>
                      <DropdownMenuItem disabled>
                        <Badge className="bg-gold-500/20 text-gold-600 border-gold-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          {profile.membership_tier}
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="hover:text-electric-400 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {profile.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="hover:text-electric-400 cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:text-electric-400 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild className="hover:text-electric-400 transition-colors">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-electric-400 to-frost-400 hover:from-electric-500 hover:to-frost-500 transition-all"
              >
                <Link href="/signup">Join Now</Link>
              </Button>
            </div>
          )}

          {/* Mobile Sign Out Button for Authenticated Users */}
          {user && (
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hover:text-electric-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

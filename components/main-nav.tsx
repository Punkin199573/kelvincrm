"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Crown, User, LogOut, ShoppingCart } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/store/cart-context"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileNav } from "@/components/mobile-nav"
import Image from "next/image"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Store", href: "/store" },
  { name: "Meet & Greet", href: "/meet-and-greet" },
  { name: "Community", href: "/community" },
  { name: "Content", href: "/content" },
]

export function MainNav() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { items } = useCart()

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/kelvin-logo.png" alt="Kelvin Creekman" width={40} height={40} className="rounded-full" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent">
              Kelvin Creekman
            </h1>
            <p className="text-xs text-muted-foreground">Fan Club</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-fire-600 dark:text-ice-400" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Cart Button (Desktop) */}
          <Button asChild variant="ghost" size="icon" className="hidden md:flex relative">
            <Link href="/store">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-fire-500 dark:bg-ice-500">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Theme Toggle (Desktop) */}
          <div className="hidden md:block">
            <ModeToggle />
          </div>

          {/* User Menu (Desktop) */}
          {user && profile ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-fire dark:bg-gradient-ice flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden lg:block">{profile.full_name || "Fan"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  {profile.is_admin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Crown className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-fire dark:bg-gradient-ice">
                <Link href="/signup">Join Now</Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

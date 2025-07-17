"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut, Settings, Crown, ShoppingCart } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useCart } from "@/components/store/cart-context"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Store", href: "/store" },
  { name: "Content", href: "/content" },
  { name: "Meet & Greet", href: "/meet-and-greet" },
  { name: "Community", href: "/community" },
]

export function MainNav() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { items } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "avalanche_backstage":
        return (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Avalanche
          </Badge>
        )
      case "blizzard_vip":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Blizzard
          </Badge>
        )
      case "frost_fan":
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white border-0 text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Frost
          </Badge>
        )
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/creekman-logo.png"
            alt="Kelvin Creekman"
            className="h-8 w-8 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder-logo.png"
            }}
          />
          <span className="hidden font-bold sm:inline-block">Kelvin Creekman</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Cart */}
          <Link href="/store" className="relative">
            <Button variant="ghost" size="sm" aria-label="Shopping cart">
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || user.email || ""} />
                    <AvatarFallback>{profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    {profile?.tier && <div className="pt-1">{getTierBadge(profile.tier)}</div>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {profile?.is_admin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="sm" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="flex items-center space-x-2 pb-4 border-b" onClick={() => setIsOpen(false)}>
                  <img
                    src="/creekman-logo.png"
                    alt="Kelvin Creekman"
                    className="h-8 w-8 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder-logo.png"
                    }}
                  />
                  <span className="font-bold">Kelvin Creekman</span>
                </Link>

                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-2 py-1 text-lg transition-colors hover:text-foreground/80",
                      pathname === item.href ? "text-foreground" : "text-foreground/60",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {user && (
                  <>
                    <div className="border-t pt-4">
                      <Link href="/dashboard" className="block px-2 py-1 text-lg" onClick={() => setIsOpen(false)}>
                        Dashboard
                      </Link>
                      {profile?.is_admin && (
                        <Link href="/admin" className="block px-2 py-1 text-lg" onClick={() => setIsOpen(false)}>
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsOpen(false)
                        }}
                        className="block w-full text-left px-2 py-1 text-lg"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

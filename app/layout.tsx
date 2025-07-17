import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { CartProvider } from "@/components/store/cart-context"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { SuperFansWidget } from "@/components/super-fans-widget"
import { MobileFooterNav } from "@/components/mobile-footer-nav"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kelvin Creekman Fan Club",
  description: "Join the official Kelvin Creekman fan club for exclusive content, events, and merchandise.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <div className="relative flex min-h-screen flex-col">
                <MainNav />
                <main className="flex-1">{children}</main>
                <SiteFooter />
                <MobileFooterNav />
                <SuperFansWidget />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

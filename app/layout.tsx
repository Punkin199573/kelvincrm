import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { MobileFooterNav } from "@/components/mobile-footer-nav"
import { AuthProvider } from "@/components/auth/auth-provider"
import { CartProvider } from "@/components/store/cart-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Kelvin Creekman Fan Club",
  description: "Join the official Kelvin Creekman fan club for exclusive content, events, and merchandise.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <MainNav />
                <main className="flex-1">{children}</main>
                <SiteFooter />
                <MobileFooterNav />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

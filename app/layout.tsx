import type React from "react"
import "./globals.css"
import { Mona_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { MobileFooterNav } from "@/components/mobile-footer-nav"
import { AuthProvider } from "@/components/auth/auth-provider"
import { CartProvider } from "@/components/store/cart-context"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <MainNav />
              <main className="flex-grow">{children}</main>
              <SiteFooter />
              <MobileFooterNav />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };

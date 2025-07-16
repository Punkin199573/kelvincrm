"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Heart, ExternalLink } from "lucide-react"
import Link from "next/link"

export function SuperFans() {
  const handleTikTokClick = () => {
    window.open("https://www.tiktok.com/@kelvincrm", "_blank", "noopener,noreferrer")
  }

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/kelvincrm", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="bg-gradient-to-br from-fire-500/10 via-background to-ice-500/10 dark:from-ice-500/10 dark:via-background dark:to-fire-500/10 border-fire-500/20 dark:border-ice-500/20 backdrop-blur-lg shadow-2xl">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Star className="h-5 w-5 text-fire-500 dark:text-ice-400 fill-current" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-fire-500 dark:bg-ice-400 rounded-full animate-pulse" />
              </div>
              <h3 className="font-bold text-fire-600 dark:text-ice-400 text-sm">Super Fans</h3>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-fire-500/10 dark:bg-ice-500/10 text-fire-600 dark:text-ice-400 border-fire-500/20 dark:border-ice-500/20"
            >
              Live
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-lg font-bold text-fire-600 dark:text-ice-400">2.4K</span>
              </div>
              <p className="text-xs text-muted-foreground">Active Fans</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 text-red-500 fill-current" />
                <span className="text-lg font-bold text-fire-600 dark:text-ice-400">98%</span>
              </div>
              <p className="text-xs text-muted-foreground">Love Rate</p>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleTikTokClick}
              className="w-full h-8 bg-black hover:bg-black/80 text-white text-xs font-medium transition-all duration-200 hover:scale-105"
              size="sm"
            >
              <svg className="h-3 w-3 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
              Follow on TikTok
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>

            <Button
              onClick={handleInstagramClick}
              className="w-full h-8 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white text-xs font-medium transition-all duration-200 hover:scale-105"
              size="sm"
            >
              <svg className="h-3 w-3 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Follow on Instagram
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {/* Join CTA */}
          <Link href="/join" className="block">
            <Button className="w-full h-8 bg-gradient-fire dark:bg-gradient-ice hover:opacity-90 text-white dark:text-black text-xs font-medium transition-all duration-200 hover:scale-105">
              Join the Club
              <Star className="h-3 w-3 ml-1 fill-current" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

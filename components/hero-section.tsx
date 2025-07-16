"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Music, Users, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <Badge className="bg-fire-500/20 text-fire-600 border-fire-500/30 dark:bg-ice-500/20 dark:text-ice-400 dark:border-ice-500/30">
                <Music className="h-3 w-3 mr-1" />
                Rock & Metal Artist
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent">Kelvin</span>
                <br />
                <span className="bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent">Creekman</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Join the ultimate fan experience with exclusive content, live sessions, merchandise, and direct access
                to rock and metal sensation Kelvin Creekman.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-fire-600 dark:text-ice-400">1K+</div>
                <div className="text-sm text-muted-foreground">Fans</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-fire-600 dark:text-ice-400">50+</div>
                <div className="text-sm text-muted-foreground">Songs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-fire-600 dark:text-ice-400">25+</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-gradient-fire dark:bg-gradient-ice text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/join">
                  <Users className="h-5 w-5 mr-2" />
                  Join Fan Club
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-fire-500/30 text-fire-600 hover:bg-fire-500/10 dark:border-ice-500/30 dark:text-ice-400 dark:hover:bg-ice-500/10 bg-transparent"
              >
                <Link href="/events">
                  <Calendar className="h-5 w-5 mr-2" />
                  View Events
                </Link>
              </Button>
            </div>
          </div>

          {/* Image/Visual Content */}
          <div className="relative order-first lg:order-last">
            <div className="relative w-full max-w-md mx-auto lg:max-w-none">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-fire-500/20 to-electric-500/20 dark:from-ice-500/20 dark:to-electric-500/20 border border-fire-500/20 dark:border-ice-500/20">
                <Image src="/kelvin-logo.png" alt="Kelvin Creekman" fill className="object-cover" priority />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
                  >
                    <Play className="h-6 w-6 text-white ml-1" />
                  </Button>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-fire-500 dark:bg-ice-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                🎸 Live Now
              </div>

              <div className="absolute -bottom-4 -left-4 bg-electric-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                🔥 Trending
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-fire-500/30 dark:border-ice-500/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-fire-500 dark:bg-ice-500 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}

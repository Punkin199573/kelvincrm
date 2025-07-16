"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Star, Instagram, Music } from "lucide-react"
import Link from "next/link"

const superFans = [
  {
    name: "THERESA RUSSELL",
    tier: "Avalanche Backstage",
    instagram: "https://www.instagram.com/theresa4kelvin?igsh=MWdlNnFtaHQyMjBxbA==",
    tiktok: "https://www.tiktok.com/@theresa4kelvin", // Using a placeholder since only Instagram was provided
  },
  {
    name: "Martha bernie",
    tier: "Blizzard VIP",
    instagram: "https://www.instagram.com/martha_bernie", // Using placeholder
    tiktok: "https://www.tiktok.com/@martha_bernie?_t=ZM-8y3uUlt2V2D&_r=1",
  },
  {
    name: "Manja",
    tier: "Frost Fan",
    instagram: "https://www.instagram.com/lk_larr_", // Using placeholder
    tiktok: "https://www.tiktok.com/@lk_larr_?_t=ZS-8xyuzCdnwMk&_r=1",
  },
]

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Avalanche Backstage":
      return "bg-gradient-to-r from-purple-500 to-pink-500"
    case "Blizzard VIP":
      return "bg-gradient-to-r from-blue-500 to-cyan-500"
    case "Frost Fan":
      return "bg-gradient-to-r from-gray-400 to-gray-600"
    default:
      return "bg-gradient-to-r from-gray-400 to-gray-600"
  }
}

export function SuperFans() {
  return (
    <section className="py-16 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-fire dark:bg-gradient-ice bg-clip-text text-transparent">
            Super Fans Hall of Fame
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet our most dedicated fans who've shown incredible support for Kelvin Creekman's music journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {superFans.map((fan, index) => (
            <Card
              key={fan.name}
              className="border-fire-500/20 dark:border-ice-500/20 hover:shadow-lg transition-all duration-300 group"
            >
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fire-500 to-electric-500 dark:from-ice-500 dark:to-electric-500 flex items-center justify-center">
                    <Crown className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge className={`${getTierColor(fan.tier)} text-white border-0`}>
                      <Star className="h-3 w-3 mr-1" />#{index + 1}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-fire-600 dark:text-ice-400">{fan.name}</CardTitle>
                <CardDescription className="font-medium">
                  <Badge
                    variant="outline"
                    className="border-fire-500/30 text-fire-600 dark:border-ice-500/30 dark:text-ice-400"
                  >
                    {fan.tier}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  A true supporter of Kelvin's rock and metal journey, showing incredible dedication to the music and
                  community.
                </p>

                <div className="flex justify-center gap-3">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-pink-500/30 text-pink-600 hover:bg-pink-500/10 dark:border-pink-400/30 dark:text-pink-400 bg-transparent"
                  >
                    <Link href={fan.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10 dark:border-purple-400/30 dark:text-purple-400 bg-transparent"
                  >
                    <Link href={fan.tiktok} target="_blank" rel="noopener noreferrer">
                      <Music className="h-4 w-4 mr-2" />
                      TikTok
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Want to join our Super Fans Hall of Fame? Show your support and become part of the community!
          </p>
          <Button asChild className="bg-gradient-fire dark:bg-gradient-ice">
            <Link href="/join">Join the Fan Club</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

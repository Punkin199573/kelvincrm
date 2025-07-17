"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, ExternalLink, Instagram, Music } from "lucide-react"
import Image from "next/image"

const superFans = [
  {
    name: "THERESA RUSSELL",
    avatar: "/placeholder-user.jpg",
    tier: "Avalanche Backstage",
    joinDate: "2023",
    socialLinks: [
      {
        platform: "Instagram",
        url: "https://www.instagram.com/theresa4kelvin?igsh=MWdlNnFtaHQyMjBxbA==",
        icon: Instagram,
        color: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      },
    ],
  },
  {
    name: "Martha Bernie",
    avatar: "/placeholder-user.jpg",
    tier: "Blizzard VIP",
    joinDate: "2023",
    socialLinks: [
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@martha_bernie?_t=ZM-8y3uUlt2V2D&_r=1",
        icon: Music,
        color: "from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700",
      },
    ],
  },
  {
    name: "Manja",
    avatar: "/placeholder-user.jpg",
    tier: "Frost Fan",
    joinDate: "2024",
    socialLinks: [
      {
        platform: "TikTok",
        url: "https://www.tiktok.com/@lk_larr_?_t=ZS-8xyuzCdnwMk&_r=1",
        icon: Music,
        color: "from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700",
      },
    ],
  },
]

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Avalanche Backstage":
      return "from-purple-500 to-pink-500"
    case "Blizzard VIP":
      return "from-blue-500 to-cyan-500"
    case "Frost Fan":
      return "from-gray-400 to-gray-600"
    default:
      return "from-gray-400 to-gray-600"
  }
}

export function SuperFans() {
  return (
    <section className="py-8 md:py-16 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile First */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 w-6 md:h-8 md:w-8 text-gold-500" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              Super Fans Hall of Fame
            </h2>
            <Crown className="h-6 w-6 md:h-8 md:w-8 text-gold-500" />
          </div>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Meet our most dedicated fans who've been with Kelvin from the beginning. These amazing supporters help make
            our community special!
          </p>
        </div>

        {/* Cards Grid - Mobile First Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {superFans.map((fan, index) => (
            <Card
              key={fan.name}
              className="group hover:shadow-xl transition-all duration-300 border-gold-500/20 bg-gradient-to-br from-card via-card to-gold-500/5 h-full"
            >
              <CardHeader className="text-center pb-3 md:pb-4">
                <div className="relative mx-auto mb-3 md:mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-gold-500/30 shadow-lg">
                    <Image
                      src={fan.avatar || "/placeholder.svg"}
                      alt={fan.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-gold-500 text-white border-gold-600 text-xs">
                      <Star className="h-2 w-2 md:h-3 md:w-3 mr-1" />#{index + 1}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-gold-600 dark:text-gold-400 leading-tight">
                  {fan.name}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  <Badge variant="outline" className="border-gold-500/50 text-gold-600 dark:text-gold-400 text-xs">
                    {fan.tier}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-3 md:space-y-4 px-4 pb-4">
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Crown className="h-3 w-3 md:h-4 md:w-4 text-gold-500" />
                  <span>Fan since {fan.joinDate}</span>
                </div>

                {/* Social Links - Mobile Optimized */}
                <div className="flex justify-center gap-2">
                  {fan.socialLinks.map((social, socialIndex) => {
                    const IconComponent = social.icon
                    return (
                      <Button
                        key={socialIndex}
                        asChild
                        size="sm"
                        className={`bg-gradient-to-r ${social.color} text-white border-0 shadow-lg text-xs md:text-sm px-3 py-2 h-auto min-h-[36px] flex-1 max-w-[120px]`}
                      >
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 md:gap-2"
                        >
                          <IconComponent className="h-3 w-3 md:h-4 md:w-4" />
                          <span className="truncate">{social.platform}</span>
                          <ExternalLink className="h-2 w-2 md:h-3 md:w-3 flex-shrink-0" />
                        </a>
                      </Button>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-gold-500/20">
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    "Thank you for being an amazing part of our community! 🎸"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action - Mobile Optimized */}
        <div className="text-center">
          <Card className="max-w-md mx-auto border-gold-500/20 bg-gradient-to-br from-card to-gold-500/5">
            <CardContent className="p-4 md:p-6">
              <Crown className="h-10 w-10 md:h-12 md:w-12 text-gold-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-gold-600 dark:text-gold-400 mb-2">
                Want to be featured?
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 leading-relaxed">
                Join our highest tier membership and become part of our Super Fans community!
              </p>
              <Button
                className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white w-full md:w-auto"
                asChild
              >
                <a href="/join">Upgrade Membership</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

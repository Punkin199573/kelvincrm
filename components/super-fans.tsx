"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, ExternalLink } from "lucide-react"
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
        icon: "📷",
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
        icon: "🎵",
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
        icon: "🎵",
      },
    ],
  },
]

export function SuperFans() {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-gold-500" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              Super Fans
            </h2>
            <Crown className="h-8 w-8 text-gold-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet our most dedicated fans who've been with Kelvin from the beginning. These amazing supporters help make
            our community special!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {superFans.map((fan, index) => (
            <Card
              key={fan.name}
              className="group hover:shadow-xl transition-all duration-300 border-gold-500/20 bg-gradient-to-br from-card via-card to-gold-500/5"
            >
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gold-500/30 shadow-lg">
                    <Image
                      src={fan.avatar || "/placeholder.svg"}
                      alt={fan.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-gold-500 text-white border-gold-600">
                      <Star className="h-3 w-3 mr-1" />#{index + 1}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gold-600 dark:text-gold-400">{fan.name}</CardTitle>
                <CardDescription className="text-sm">
                  <Badge variant="outline" className="border-gold-500/50 text-gold-600 dark:text-gold-400">
                    {fan.tier}
                  </Badge>
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Crown className="h-4 w-4 text-gold-500" />
                  <span>Fan since {fan.joinDate}</span>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-2">
                  {fan.socialLinks.map((social, socialIndex) => (
                    <Button
                      key={socialIndex}
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-gold-500/30 hover:border-gold-500 hover:bg-gold-500/10 transition-colors bg-transparent"
                    >
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <span>{social.icon}</span>
                        <span>{social.platform}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="pt-2 border-t border-gold-500/20">
                  <p className="text-xs text-muted-foreground italic">
                    "Thank you for being an amazing part of our community! 🎸"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="max-w-md mx-auto border-gold-500/20 bg-gradient-to-br from-card to-gold-500/5">
            <CardContent className="p-6">
              <Crown className="h-12 w-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gold-600 dark:text-gold-400 mb-2">Want to be featured?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our highest tier membership and become part of our Super Fans community!
              </p>
              <Button className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white">
                Upgrade Membership
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Instagram, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Custom TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

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
        icon: TikTokIcon,
        color: "from-black to-red-600 hover:from-gray-800 hover:to-red-700",
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
        icon: TikTokIcon,
        color: "from-black to-red-600 hover:from-gray-800 hover:to-red-700",
      },
    ],
  },
]

export function SuperFansWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-20 right-4 z-40 w-72 max-w-[calc(100vw-2rem)]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-gold-500/30 bg-gradient-to-br from-card/95 via-card/95 to-gold-500/5 backdrop-blur-lg shadow-xl">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full p-3 h-auto justify-between hover:bg-gold-500/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-gold-500" />
                <span className="text-sm font-semibold text-gold-600 dark:text-gold-400">Super Fans</span>
                <Badge className="bg-gold-500/20 text-gold-600 text-xs px-1.5 py-0.5">{superFans.length}</Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gold-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gold-500" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-3 pt-0 space-y-3">
              {superFans.map((fan, index) => (
                <div
                  key={fan.name}
                  className="flex items-center gap-3 p-2 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold-500/30">
                      <Image
                        src={fan.avatar || "/placeholder.svg"}
                        alt={fan.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-gold-500 text-white border-gold-600 text-xs h-4 w-4 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gold-600 dark:text-gold-400 truncate">{fan.name}</p>
                    <p className="text-xs text-muted-foreground">Since {fan.joinDate}</p>
                  </div>

                  <div className="flex gap-1">
                    {fan.socialLinks.map((social, socialIndex) => {
                      const IconComponent = social.icon
                      return (
                        <Button
                          key={socialIndex}
                          asChild
                          size="sm"
                          className={`bg-gradient-to-r ${social.color} text-white border-0 h-6 w-6 p-0`}
                        >
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center"
                          >
                            <IconComponent className="h-3 w-3" />
                          </a>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-gold-500/20">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white h-7 text-xs"
                >
                  <a href="/join">
                    <Crown className="h-3 w-3 mr-1" />
                    Join Hall of Fame
                  </a>
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}

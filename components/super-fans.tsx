"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Users, ExternalLink, Instagram, Music } from "lucide-react"

const superFans = [
  {
    id: 1,
    name: "Sarah M.",
    tier: "Avalanche Backstage",
    avatar: "/placeholder-user.jpg",
    location: "Los Angeles, CA",
    joinedDays: 234,
    isOnline: true,
  },
  {
    id: 2,
    name: "Mike R.",
    tier: "Blizzard VIP",
    avatar: "/placeholder-user.jpg",
    location: "Nashville, TN",
    joinedDays: 156,
    isOnline: true,
  },
  {
    id: 3,
    name: "Emma K.",
    tier: "Avalanche Backstage",
    avatar: "/placeholder-user.jpg",
    location: "Austin, TX",
    joinedDays: 89,
    isOnline: false,
  },
  {
    id: 4,
    name: "Alex P.",
    tier: "Frost Fan",
    avatar: "/placeholder-user.jpg",
    location: "Seattle, WA",
    joinedDays: 45,
    isOnline: true,
  },
]

const socialLinks = [
  {
    name: "TikTok",
    icon: Music,
    url: "https://www.tiktok.com/@kelvin.creekman",
    color: "hover:text-pink-500",
    bgColor: "hover:bg-pink-500/10",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/kelvin.creekman",
    color: "hover:text-purple-500",
    bgColor: "hover:bg-purple-500/10",
  },
]

export function SuperFans() {
  const [currentFanIndex, setCurrentFanIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFanIndex((prev) => (prev + 1) % superFans.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const currentFan = superFans[currentFanIndex]
  const onlineFansCount = superFans.filter((fan) => fan.isOnline).length

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Avalanche Backstage":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "Blizzard VIP":
        return "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
      case "Frost Fan":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="backdrop-blur-md bg-white/10 dark:bg-black/20 border-white/20 dark:border-white/10 shadow-2xl">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Users className="h-5 w-5 text-fire-400 dark:text-ice-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-white">Super Fans</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
            >
              ×
            </Button>
          </div>

          {/* Current Fan Spotlight */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-white/30">
                  <AvatarImage src={currentFan.avatar || "/placeholder.svg"} alt={currentFan.name} />
                  <AvatarFallback className="bg-fire-500 dark:bg-ice-500 text-white">
                    {currentFan.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {currentFan.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white truncate">{currentFan.name}</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                </div>
                <Badge className={`text-xs ${getTierColor(currentFan.tier)} border-0`}>{currentFan.tier}</Badge>
              </div>
            </div>

            <div className="text-xs text-white/70 space-y-1">
              <div className="flex justify-between">
                <span>Location:</span>
                <span>{currentFan.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Fan for:</span>
                <span>{currentFan.joinedDays} days</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center pt-2 border-t border-white/20">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{onlineFansCount}</div>
              <div className="text-xs text-white/70">Online Now</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{superFans.length}</div>
              <div className="text-xs text-white/70">Super Fans</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-2 pt-2 border-t border-white/20">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSocialClick(social.url)}
                  className={`flex-1 h-8 text-white/80 hover:text-white ${social.bgColor} transition-all duration-200 hover:scale-105`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  <span className="text-xs">{social.name}</span>
                  <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                </Button>
              )
            })}
          </div>

          {/* Fan Indicators */}
          <div className="flex justify-center gap-1">
            {superFans.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFanIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFanIndex ? "bg-fire-400 dark:bg-ice-400 scale-125" : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Restore button when hidden */}
      {!isVisible && (
        <Button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 right-4 z-50 h-10 w-10 p-0 rounded-full bg-fire-500 dark:bg-ice-500 hover:bg-fire-600 dark:hover:bg-ice-600 shadow-lg"
        >
          <Users className="h-5 w-5 text-white" />
        </Button>
      )}
    </div>
  )
}

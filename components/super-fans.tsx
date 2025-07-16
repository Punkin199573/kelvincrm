"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Instagram, Music } from "lucide-react"
import { motion } from "framer-motion"

export function SuperFans() {
  const handleTikTokClick = () => {
    window.open("https://www.tiktok.com/@kelvin.creekman", "_blank", "noopener,noreferrer")
  }

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/kelvin.creekman", "_blank", "noopener,noreferrer")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
        whileHover={{ scale: 1.05 }}
        className="relative"
      >
        <Card className="w-80 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 border-0 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <CardContent className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Super Fans</h3>
                <p className="text-sm text-white/80">Connect with Kelvin</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Live
              </Badge>
            </div>

            <p className="text-sm text-white/90 mb-6 leading-relaxed">
              Follow Kelvin on social media for exclusive content, behind-the-scenes moments, and real-time updates!
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleTikTokClick}
                className="flex-1 bg-black/30 hover:bg-black/50 border border-white/20 text-white transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Music className="w-4 h-4 mr-2" />
                TikTok
              </Button>

              <Button
                onClick={handleInstagramClick}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 text-white transition-all duration-300 hover:scale-105"
                size="sm"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-xs text-white/70 text-center">Join thousands of fans worldwide! 🌟</p>
            </div>
          </CardContent>
        </Card>

        {/* Animated glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 rounded-lg blur opacity-30 animate-pulse" />
      </motion.div>
    </div>
  )
}

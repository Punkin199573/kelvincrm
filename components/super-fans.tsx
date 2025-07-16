"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Instagram, Music, ExternalLink, Sparkles, Heart } from "lucide-react"
import { motion } from "framer-motion"

export function SuperFans() {
  const handleTikTokClick = () => {
    window.open("https://www.tiktok.com/@kelvincrm", "_blank", "noopener,noreferrer")
  }

  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/kelvincrm", "_blank", "noopener,noreferrer")
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
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fire-500/20 via-electric-500/20 to-ice-500/20 blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <Card className="relative w-80 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-fire-500/30 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5 text-electric-400" />
                </motion.div>
                <h3 className="font-bold text-white">Super Fans</h3>
              </div>
              <Badge className="bg-fire-500/20 text-fire-300 border-fire-500/30 animate-pulse">
                <Heart className="h-3 w-3 mr-1" />
                VIP
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                Join the exclusive community of Kelvin Creekman's biggest supporters! Get behind-the-scenes content,
                early access to new music, and connect directly with Kelvin.
              </p>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleTikTokClick}
                    className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white border-0 shadow-lg"
                    size="sm"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    TikTok
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleInstagramClick}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                    size="sm"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </motion.div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-electric-400 rounded-full animate-pulse" />
                  Exclusive behind-the-scenes content
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-fire-400 rounded-full animate-pulse" />
                  Early access to new releases
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-ice-400 rounded-full animate-pulse" />
                  Direct interaction with Kelvin
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

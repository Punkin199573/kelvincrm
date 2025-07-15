"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Crown, Zap, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

const tiers = [
  {
    name: "Frost Fan",
    price: "$9.99",
    color: "from-blue-400 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: Star,
    features: ["Exclusive content access", "Monthly newsletter", "Community forum access", "Early event notifications"],
  },
  {
    name: "Blizzard VIP",
    price: "$19.99",
    color: "from-purple-400 to-pink-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    icon: Zap,
    popular: true,
    features: [
      "Everything in Frost Fan",
      "VIP event access",
      "Exclusive merchandise",
      "Monthly video calls",
      "Behind-the-scenes content",
    ],
  },
  {
    name: "Avalanche Backstage",
    price: "$39.99",
    color: "from-yellow-400 to-orange-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: Crown,
    features: [
      "Everything in Blizzard VIP",
      "Backstage access",
      "Personal meet & greets",
      "Signed merchandise",
      "Direct messaging",
      "Song request privileges",
    ],
  },
]

const socialLinks = {
  tiktok: "https://www.tiktok.com/@kelvincreekman",
  instagram: "https://www.instagram.com/kelvincreekman",
}

export function SuperFans() {
  const handleSocialClick = (platform: "tiktok" | "instagram") => {
    window.open(socialLinks[platform], "_blank", "noopener,noreferrer")
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-background via-background/95 to-electric-950/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-electric-400 to-frost-400 bg-clip-text text-transparent">
              Join the Super Fans
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get exclusive access to Kelvin's world with premium membership tiers
            </p>
          </motion.div>
        </div>

        {/* Membership Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, index) => {
            const IconComponent = tier.icon
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`relative h-full ${tier.borderColor} ${tier.bgColor} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 ${tier.popular ? "ring-2 ring-purple-500/50" : ""}`}
                >
                  <CardContent className="p-6">
                    {/* Tier Header */}
                    <div className="text-center mb-6">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${tier.bgColor} mb-3`}
                      >
                        <IconComponent className="h-6 w-6 text-current" />
                      </div>
                      <h3 className={`text-xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                        {tier.name}
                      </h3>
                      <div className="text-2xl font-bold mt-2">{tier.price}</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tier.color}`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white font-medium transition-all duration-300 hover:shadow-lg`}
                      size="lg"
                    >
                      Choose {tier.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-block border-electric-700/30 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-electric-400">Follow Kelvin on Social Media</h3>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleSocialClick("tiktok")}
                  variant="outline"
                  size="lg"
                  className="group border-electric-700/30 hover:border-electric-500/50 hover:bg-electric-500/10 transition-all duration-300"
                >
                  <svg
                    className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                  <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>

                <Button
                  onClick={() => handleSocialClick("instagram")}
                  variant="outline"
                  size="lg"
                  className="group border-electric-700/30 hover:border-electric-500/50 hover:bg-electric-500/10 transition-all duration-300"
                >
                  <svg
                    className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                  <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

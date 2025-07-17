"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Star, Zap, Music, Video, Gift, Calendar, Heart, Sparkles } from "lucide-react"
import Link from "next/link"

const tiers = [
  {
    name: "Frost Fan",
    price: "$9.99",
    period: "/month",
    description: "Perfect for new fans wanting to connect with Kelvin",
    color: "from-gray-400 to-gray-600",
    borderColor: "border-gray-400/30",
    icon: Star,
    popular: false,
    features: [
      "Monthly exclusive content",
      "Fan community access",
      "Basic merchandise discounts (10%)",
      "Monthly newsletter",
      "Early event notifications",
      "Basic fan forum access",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_FROST_FAN_PRICE_ID,
  },
  {
    name: "Blizzard VIP",
    price: "$24.99",
    period: "/month",
    description: "For dedicated fans who want premium access and perks",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-400/50",
    icon: Crown,
    popular: true,
    features: [
      "Everything in Frost Fan",
      "Weekly exclusive content",
      "VIP merchandise discounts (20%)",
      "Priority event booking",
      "Monthly virtual meet & greets",
      "Exclusive behind-the-scenes content",
      "VIP fan forum access",
      "Personalized birthday message",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_BLIZZARD_VIP_PRICE_ID,
  },
  {
    name: "Avalanche Backstage",
    price: "$49.99",
    period: "/month",
    description: "Ultimate fan experience with exclusive backstage access",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-400/50",
    icon: Zap,
    popular: false,
    features: [
      "Everything in Blizzard VIP",
      "Daily exclusive content",
      "Maximum merchandise discounts (30%)",
      "Guaranteed event tickets",
      "Weekly private video calls",
      "Exclusive unreleased music previews",
      "Backstage virtual tours",
      "Direct messaging with Kelvin",
      "Annual exclusive merchandise box",
      "Concert sound check access",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID,
  },
]

const benefits = [
  {
    icon: Music,
    title: "Exclusive Music",
    description: "Get early access to new tracks and unreleased content",
  },
  {
    icon: Video,
    title: "Behind the Scenes",
    description: "See what goes on behind the music creation process",
  },
  {
    icon: Gift,
    title: "Special Merchandise",
    description: "Access to limited edition and tier-exclusive items",
  },
  {
    icon: Calendar,
    title: "Priority Events",
    description: "First access to concert tickets and special events",
  },
  {
    icon: Heart,
    title: "Direct Connection",
    description: "Personal interactions and messages from Kelvin",
  },
  {
    icon: Sparkles,
    title: "VIP Treatment",
    description: "Special perks and recognition as a valued fan",
  },
]

export function MembershipTiers() {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Crown className="h-4 w-4" />
            Membership Tiers
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Join the Fan Club
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Choose your level of access and get closer to Kelvin than ever before. Each tier unlocks exclusive content,
            merchandise, and experiences designed just for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier, index) => {
            const Icon = tier.icon
            return (
              <Card
                key={tier.name}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  tier.popular ? "ring-2 ring-primary/50 shadow-xl scale-105" : "hover:shadow-lg"
                } ${tier.borderColor} bg-card/50 backdrop-blur-sm`}
              >
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-bold">
                      🔥 MOST POPULAR
                    </div>
                  </div>
                )}

                <CardHeader className={tier.popular ? "pt-12" : "pt-6"}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${tier.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {tier.popular && <Badge className="bg-primary/20 text-primary border-primary/30">Best Value</Badge>}
                  </div>

                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>

                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {tier.price}
                    </span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                      tier.popular
                        ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-muted to-muted/80 hover:from-primary/20 hover:to-primary/10 text-foreground hover:text-primary border border-border hover:border-primary/30"
                    }`}
                  >
                    <Link href="/signup" className="flex items-center justify-center gap-2">
                      Join {tier.name}
                      <Icon className="h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              What You Get as a Member
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50 hover:bg-card/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{benefit.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 border border-primary/20">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ready to Join the Family?
            </span>
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your journey with Kelvin Creekman today. Choose your tier and unlock exclusive content, merchandise,
            and experiences that bring you closer to the music you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Start Your Membership
                <Crown className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-6 text-lg font-semibold transition-all duration-300 bg-transparent"
            >
              <Link href="/login" className="flex items-center gap-2">
                Already a Member?
                <Star className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

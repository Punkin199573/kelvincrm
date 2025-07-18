"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Users, Clock, Star, Crown, Zap, Ticket, Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: "concert" | "meetgreet" | "virtual" | "vip"
  tierRequired: "public" | "frost" | "blizzard" | "avalanche"
  price: number
  memberPrice: number
  capacity: number
  registered: number
  image: string
  featured: boolean
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "VIP Exclusive Experience",
    description:
      "Ultimate VIP experience with Kevin Creekman - exclusive meet & greet, backstage access, and premium seating",
    date: "2024-08-15",
    time: "7:00 PM",
    location: "Private Venue, Los Angeles",
    type: "vip",
    tierRequired: "avalanche",
    price: 500,
    memberPrice: 400,
    capacity: 25,
    registered: 20,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7934-ZAO430RZhLsFW9qwxTwrnV7RrIXpJW.jpeg",
    featured: true,
  },
  {
    id: "2",
    title: "Germany Tour - VIP Meet & Greet",
    description: "Join Kevin Creekman in Germany for an exclusive VIP meet & greet experience before the main show",
    date: "2024-09-22",
    time: "6:00 PM",
    location: "Berlin, Germany",
    type: "meetgreet",
    tierRequired: "blizzard",
    price: 200,
    memberPrice: 160,
    capacity: 50,
    registered: 42,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8d8507d8-d667-40d6-8bb4-eea635dff273-Dk4wCMlQYUKBmAUgiCrJIJEdIx80UK.jpeg",
    featured: true,
  },
  {
    id: "3",
    title: "Intimate Fan Meet & Greet",
    description: "Personal conversation and photo opportunity with Kevin in a small group setting",
    date: "2024-07-28",
    time: "3:00 PM",
    location: "Private Studio, Nashville",
    type: "meetgreet",
    tierRequired: "frost",
    price: 150,
    memberPrice: 120,
    capacity: 30,
    registered: 25,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/The_Creekman_Event-58_2000x2000-CtPRJkaWByoW1x9N2BiXftaougF8xZ.webp",
    featured: false,
  },
  {
    id: "4",
    title: "Electric Storm Concert",
    description: "High-energy concert performance featuring Kevin's latest hits and fan favorites",
    date: "2024-10-05",
    time: "8:00 PM",
    location: "Madison Square Garden, New York",
    type: "concert",
    tierRequired: "public",
    price: 85,
    memberPrice: 68,
    capacity: 15000,
    registered: 12500,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c49d2cd7bafcfb2e4c16c9469aa472e8.jpg-wlcDXmX0RqDCDZQMqegBWOMkiOVQhn.jpeg",
    featured: false,
  },
  {
    id: "5",
    title: "Red Light Performance",
    description: "Intimate acoustic performance in a unique red-lit venue setting",
    date: "2024-11-12",
    time: "7:30 PM",
    location: "The Underground, Chicago",
    type: "concert",
    tierRequired: "frost",
    price: 65,
    memberPrice: 52,
    capacity: 500,
    registered: 380,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dd806a3f-3655-4c08-8d72-b039e5eaa94b-O0OjQuE89WdywQGthqkT2qsulQ0KNs.jpeg",
    featured: false,
  },
  {
    id: "6",
    title: "Arena Rock Experience",
    description: "Full arena experience with Kevin performing his biggest hits for thousands of fans",
    date: "2024-12-18",
    time: "8:00 PM",
    location: "Staples Center, Los Angeles",
    type: "concert",
    tierRequired: "public",
    price: 95,
    memberPrice: 76,
    capacity: 18000,
    registered: 15200,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/699ef53f-d4ab-4712-9c2f-5052aff31302-uYjA8b3QodbRqhBr4bYoWiVE9R2z3b.jpeg",
    featured: false,
  },
  {
    id: "7",
    title: "New Year's Eve Special",
    description: "Ring in the new year with Kevin Creekman in an unforgettable celebration",
    date: "2024-12-31",
    time: "10:00 PM",
    location: "Times Square, New York",
    type: "concert",
    tierRequired: "public",
    price: 125,
    memberPrice: 100,
    capacity: 25000,
    registered: 18000,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c6b82f5c-c13d-49da-b2a1-8d74a833c114.jpg-UtlD25pgmEbsy1hrMO7UiGeQBNeKIA.jpeg",
    featured: true,
  },
  {
    id: "8",
    title: "Spring Awakening Tour",
    description: "Kevin kicks off his spring tour with an explosive performance",
    date: "2025-03-15",
    time: "8:00 PM",
    location: "Red Rocks Amphitheatre, Colorado",
    type: "concert",
    tierRequired: "public",
    price: 110,
    memberPrice: 88,
    capacity: 9500,
    registered: 7200,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_7936-XsvghQZRjM4YlHw4xxkS14nuADAYZS.jpeg",
    featured: false,
  },
]

export function EventsGrid() {
  const [events] = useState<Event[]>(mockEvents)
  const [bookingEvent, setBookingEvent] = useState<string | null>(null)
  const { toast } = useToast()

  const handleBookEvent = async (event: Event) => {
    setBookingEvent(event.id)

    try {
      const response = await fetch("/api/create-event-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          price: event.memberPrice,
          eventDate: event.date,
          eventTime: event.time,
          location: event.location,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error booking event:", error)
      toast({
        title: "Booking Error",
        description: "Failed to process event booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBookingEvent(null)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "concert":
        return <Calendar className="h-4 w-4" />
      case "meetgreet":
        return <Users className="h-4 w-4" />
      case "virtual":
        return <MapPin className="h-4 w-4" />
      case "vip":
        return <Star className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "public":
        return <Badge variant="outline">Public</Badge>
      case "frost":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Frost+</Badge>
      case "blizzard":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Blizzard+</Badge>
      case "avalanche":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Avalanche</Badge>
      default:
        return <Badge variant="outline">Public</Badge>
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "frost":
        return <Star className="h-3 w-3" />
      case "blizzard":
        return <Zap className="h-3 w-3" />
      case "avalanche":
        return <Crown className="h-3 w-3" />
      default:
        return null
    }
  }

  const getAvailabilityColor = (registered: number, capacity: number) => {
    const percentage = (registered / capacity) * 100
    if (percentage >= 90) return "text-red-500"
    if (percentage >= 70) return "text-yellow-500"
    return "text-green-500"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Sort events: featured first, then by date
  const sortedEvents = [...events].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <div className="space-y-8">
      {/* Featured Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-electric-400">Featured Events</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedEvents
            .filter((event) => event.featured)
            .map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden border-electric-700/30 bg-background/50 backdrop-blur-lg hover:border-electric-500/50 transition-all group"
              >
                <div className="relative">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    width={800}
                    height={400}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-fire-500/90 dark:bg-electric-500/90 text-white">Featured</Badge>
                    {getTierBadge(event.tierRequired)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">{event.title}</span>
                    <div className="flex items-center gap-1 text-electric-400">
                      {getTierIcon(event.tierRequired)}
                      {getEventTypeIcon(event.type)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{event.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-electric-400" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-electric-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="h-4 w-4 text-electric-400" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Availability</span>
                      <span className={getAvailabilityColor(event.registered, event.capacity)}>
                        {event.capacity - event.registered} spots left
                      </span>
                    </div>
                    <Progress value={(event.registered / event.capacity) * 100} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-electric-400">${event.memberPrice}</div>
                      {event.price !== event.memberPrice && (
                        <div className="text-sm text-muted-foreground line-through">${event.price}</div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleBookEvent(event)}
                      disabled={bookingEvent === event.id}
                      className="bg-gradient-electric hover:animate-electric-pulse"
                    >
                      {bookingEvent === event.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 mr-2" />
                          Book Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-electric-400">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden border-electric-700/30 bg-background/50 backdrop-blur-lg hover:border-electric-500/50 transition-all group"
            >
              <div className="relative">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  width={400}
                  height={250}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  {event.featured && (
                    <Badge className="bg-fire-500/90 dark:bg-electric-500/90 text-white text-xs">Featured</Badge>
                  )}
                  {getTierBadge(event.tierRequired)}
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-electric-400" />
                    <span>
                      {formatDate(event.date)} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-electric-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Availability</span>
                    <span className={getAvailabilityColor(event.registered, event.capacity)}>
                      {event.capacity - event.registered} left
                    </span>
                  </div>
                  <Progress value={(event.registered / event.capacity) * 100} className="h-1" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-electric-400">${event.memberPrice}</div>
                    {event.price !== event.memberPrice && (
                      <div className="text-xs text-muted-foreground line-through">${event.price}</div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleBookEvent(event)}
                    disabled={bookingEvent === event.id}
                    size="sm"
                    className="bg-gradient-electric"
                  >
                    {bookingEvent === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Book"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

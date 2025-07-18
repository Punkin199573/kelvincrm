"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, MapPin, Clock, ArrowLeft, Mail } from "lucide-react"

export default function EventSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const eventId = searchParams.get("event_id")
  const [isLoading, setIsLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd fetch the booking details from your API
      // For now, we'll simulate the booking confirmation
      setTimeout(() => {
        setBookingDetails({
          eventTitle: "VIP Exclusive Experience",
          eventDate: "August 15, 2024",
          eventTime: "7:00 PM",
          location: "Private Venue, Los Angeles",
          ticketNumber: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          price: 400,
        })
        setIsLoading(false)
      }, 1000)
    }
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-400 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold">Processing your booking...</h1>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-green-500 mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your event ticket has been successfully purchased.</p>
        </div>

        {bookingDetails && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Event Details</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Confirmed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{bookingDetails.eventTitle}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-electric-400" />
                    <span>{bookingDetails.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-electric-400" />
                    <span>{bookingDetails.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-electric-400" />
                    <span>{bookingDetails.location}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Ticket Number:</span>
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{bookingDetails.ticketNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-bold text-electric-400">${bookingDetails.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-electric-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive a confirmation email with your ticket details within the next few minutes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-electric-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Event Reminders</p>
                <p className="text-sm text-muted-foreground">
                  We'll send you reminders as the event date approaches with important details.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-electric-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium">Bring Your ID</p>
                <p className="text-sm text-muted-foreground">
                  Please bring a valid photo ID that matches the name on your booking.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">View My Bookings</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

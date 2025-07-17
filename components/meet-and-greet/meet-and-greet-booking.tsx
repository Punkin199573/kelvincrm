"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Clock, Video, Shield, CreditCard, Loader2, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface BookingData {
  sessionDate: string
  sessionTime: string
  contactInfo: {
    phone?: string
    email?: string
  }
  specialRequests: string
}

const availableTimeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
]

const sessionPrice = 99.99 // Fixed price for all sessions
const sessionDuration = 30 // Fixed duration in minutes

export function MeetAndGreetBooking() {
  const [isBooking, setIsBooking] = useState(false)
  const [booking, setBooking] = useState<BookingData>({
    sessionDate: "",
    sessionTime: "",
    contactInfo: {},
    specialRequests: "",
  })

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.email) {
      setBooking((prev) => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, email: user.email },
      }))
    }
  }, [user])

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a session",
        variant: "destructive",
      })
      return
    }

    if (!booking.sessionDate || !booking.sessionTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time",
        variant: "destructive",
      })
      return
    }

    if (!booking.contactInfo.email) {
      toast({
        title: "Email Required",
        description: "Email is required for booking",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-session-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: `session_${Date.now()}`, // Generate unique session ID
          sessionDate: booking.sessionDate,
          sessionTime: booking.sessionTime,
          sessionType: "Private Video Call",
          contactInfo: booking.contactInfo,
          specialRequests: booking.specialRequests,
          price: sessionPrice,
          duration: sessionDuration,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: "Failed to process booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  // Generate available dates (next 30 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split("T")[0])
      }
    }

    return dates
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Private Video Session</CardTitle>
            <CardDescription>Please log in to book your exclusive session with Kelvin Creekman</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Log In to Book Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Book Your Private Session</h1>
        <p className="text-muted-foreground">Exclusive one-on-one video call with Kelvin Creekman</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
            <CardDescription>What's included in your private session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDuration} minutes private video call</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span>One-on-one conversation with Kelvin</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Secure Signal video call</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Private and confidential session</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Session Price</span>
              <span>${sessionPrice}</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What to Expect:</h4>
              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                <li>• Personal conversation with Kelvin</li>
                <li>• Ask questions about music, career, or life</li>
                <li>• Get exclusive insights and stories</li>
                <li>• Professional and friendly atmosphere</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Book Your Session</CardTitle>
            <CardDescription>Select your preferred date and time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date *</Label>
              <select
                id="date"
                value={booking.sessionDate}
                onChange={(e) => setBooking((prev) => ({ ...prev, sessionDate: e.target.value }))}
                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              >
                <option value="">Select a date</option>
                {getAvailableDates().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time *</Label>
              <select
                id="time"
                value={booking.sessionTime}
                onChange={(e) => setBooking((prev) => ({ ...prev, sessionTime: e.target.value }))}
                className="w-full p-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                disabled={!booking.sessionDate}
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted-foreground">All times are in EST</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={booking.contactInfo.email || ""}
                onChange={(e) =>
                  setBooking((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value },
                  }))
                }
                placeholder="your.email@example.com"
              />
              <p className="text-sm text-muted-foreground">Session details will be sent to this email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={booking.contactInfo.phone || ""}
                onChange={(e) =>
                  setBooking((prev) => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value },
                  }))
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requests">Topics or Questions (optional)</Label>
              <Textarea
                id="requests"
                placeholder="Any specific topics you'd like to discuss or questions you have for Kelvin..."
                value={booking.specialRequests}
                onChange={(e) => setBooking((prev) => ({ ...prev, specialRequests: e.target.value }))}
                rows={3}
              />
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your session will be conducted via Signal for maximum privacy and security. By booking, you agree to our
                terms of service and privacy policy.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleBooking}
              disabled={isBooking || !booking.sessionDate || !booking.sessionTime || !booking.contactInfo.email}
              className="w-full"
              size="lg"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Book & Pay ${sessionPrice}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, Phone, MessageSquare, Video, CheckCircle, ExternalLink } from "lucide-react"
import { format, addDays, setHours, setMinutes, isBefore, isAfter } from "date-fns"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BookingData {
  date: Date | undefined
  time: string
  callMethod: "whatsapp" | "signal" | "daily" | ""
  contactInfo: {
    phone?: string
    username?: string
    email?: string
  }
  specialRequests: string
}

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
]

const callMethods = {
  whatsapp: { name: "WhatsApp Video", price: 49.99, icon: Phone },
  signal: { name: "Signal Video", price: 54.99, icon: MessageSquare },
  daily: { name: "Daily.co Video", price: 59.99, icon: Video },
}

export function MeetAndGreetBooking() {
  const { user } = useAuth()
  const [booking, setBooking] = useState<BookingData>({
    date: undefined,
    time: "",
    callMethod: "",
    contactInfo: {},
    specialRequests: "",
  })
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<any>(null)

  useEffect(() => {
    if (booking.date) {
      fetchBookedSlots(booking.date)
    }
  }, [booking.date])

  const fetchBookedSlots = async (date: Date) => {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from("meet_greet_sessions")
        .select("session_date")
        .gte("session_date", startOfDay.toISOString())
        .lte("session_date", endOfDay.toISOString())
        .eq("status", "scheduled")

      if (error) throw error

      const slots = data.map((session) => {
        const date = new Date(session.session_date)
        return format(date, "HH:mm")
      })

      setBookedSlots(slots)
    } catch (error) {
      console.error("Error fetching booked slots:", error)
    }
  }

  const isSlotAvailable = (time: string) => {
    if (!booking.date) return false

    const [hours, minutes] = time.split(":").map(Number)
    const slotDateTime = setMinutes(setHours(booking.date, hours), minutes)
    const now = new Date()

    // Check if slot is in the past
    if (isBefore(slotDateTime, now)) return false

    // Check if slot is already booked
    if (bookedSlots.includes(time)) return false

    return true
  }

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    const maxDate = addDays(today, 30) // Allow booking up to 30 days in advance

    return !isBefore(date, today) && !isAfter(date, maxDate)
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please log in to book a session")
      return
    }

    if (!booking.date || !booking.time || !booking.callMethod) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate contact info based on call method
    if (booking.callMethod === "whatsapp" && !booking.contactInfo.phone) {
      toast.error("Phone number is required for WhatsApp calls")
      return
    }
    if (booking.callMethod === "signal" && !booking.contactInfo.username) {
      toast.error("Signal username is required for Signal calls")
      return
    }
    if (booking.callMethod === "daily" && !booking.contactInfo.email) {
      toast.error("Email is required for Daily.co calls")
      return
    }

    setIsLoading(true)

    try {
      const [hours, minutes] = booking.time.split(":").map(Number)
      const sessionDateTime = setMinutes(setHours(booking.date, hours), minutes)
      const price = callMethods[booking.callMethod].price

      // Create checkout session
      const response = await fetch("/api/create-session-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionDate: sessionDateTime.toISOString(),
          callMethod: booking.callMethod,
          contactInfo: booking.contactInfo,
          specialRequests: booking.specialRequests,
          price: price,
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
      toast.error("Failed to process booking. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderContactForm = () => {
    switch (booking.callMethod) {
      case "whatsapp":
        return (
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={booking.contactInfo.phone || ""}
              onChange={(e) =>
                setBooking((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, phone: e.target.value },
                }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Include country code. We'll send you a WhatsApp message with the video call link.
            </p>
          </div>
        )
      case "signal":
        return (
          <div className="space-y-2">
            <Label htmlFor="username">Signal Username *</Label>
            <Input
              id="username"
              placeholder="@yourusername"
              value={booking.contactInfo.username || ""}
              onChange={(e) =>
                setBooking((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, username: e.target.value },
                }))
              }
            />
            <p className="text-sm text-muted-foreground">
              Your Signal username (with @). We'll contact you on Signal with call details.
            </p>
          </div>
        )
      case "daily":
        return (
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={booking.contactInfo.email || ""}
              onChange={(e) =>
                setBooking((prev) => ({
                  ...prev,
                  contactInfo: { ...prev.contactInfo, email: e.target.value },
                }))
              }
            />
            <p className="text-sm text-muted-foreground">
              We'll send you a Daily.co room link via email before your session.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  // Check for payment success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get("session_id")

    if (sessionId) {
      // Fetch session details
      fetchSessionDetails(sessionId)
    }
  }, [])

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("meet_greet_sessions")
        .select("*")
        .eq("stripe_payment_intent_id", sessionId)
        .single()

      if (error) throw error

      setSessionDetails(data)
      setPaymentSuccess(true)
    } catch (error) {
      console.error("Error fetching session details:", error)
    }
  }

  const getCallButton = () => {
    if (!sessionDetails) return null

    const callMethod = sessionDetails.call_method
    const contactInfo = sessionDetails.contact_info

    switch (callMethod) {
      case "whatsapp":
        return (
          <Button
            onClick={() => window.open(`https://wa.me/${contactInfo.phone?.replace(/\D/g, "")}`, "_blank")}
            className="w-full"
          >
            <Phone className="w-4 h-4 mr-2" />
            Open WhatsApp
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )
      case "signal":
        return (
          <Button onClick={() => window.open("https://signal.org/", "_blank")} className="w-full">
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Signal App
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )
      case "daily":
        return (
          <Button
            onClick={() => window.open(sessionDetails.call_link || "https://daily.co/", "_blank")}
            className="w-full"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Daily.co Call
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        )
      default:
        return null
    }
  }

  if (paymentSuccess && sessionDetails) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>Your private session with Kelvin Creekman has been confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Session Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Date:</strong> {format(new Date(sessionDetails.session_date), "MMMM d, yyyy")}
                </p>
                <p>
                  <strong>Time:</strong> {format(new Date(sessionDetails.session_date), "h:mm a")}
                </p>
                <p>
                  <strong>Duration:</strong> {sessionDetails.duration_minutes} minutes
                </p>
                <p>
                  <strong>Call Method:</strong>{" "}
                  {callMethods[sessionDetails.call_method as keyof typeof callMethods].name}
                </p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Important Guidelines:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Please be ready 5 minutes before your scheduled time</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Find a quiet, well-lit space for the best experience</li>
                  <li>• Be respectful and follow community guidelines</li>
                  <li>• Sessions are recorded for quality and safety purposes</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">Ready to Connect?</h3>
              {getCallButton()}
              <p className="text-sm text-muted-foreground text-center">
                You can use this button when it's time for your session
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Private Session Booking</CardTitle>
            <CardDescription>Please log in to book a private video session with Kelvin Creekman</CardDescription>
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
        <h1 className="text-3xl font-bold mb-2">Book a Private Session</h1>
        <p className="text-muted-foreground">Get a personal 15-minute video call with Kelvin Creekman</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Schedule Your Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div>
              <Label className="text-base font-medium">Select Date</Label>
              <Calendar
                mode="single"
                selected={booking.date}
                onSelect={(date) => setBooking((prev) => ({ ...prev, date, time: "" }))}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-md border mt-2"
              />
            </div>

            {/* Time Selection */}
            {booking.date && (
              <div>
                <Label className="text-base font-medium">Select Time</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={booking.time === time ? "default" : "outline"}
                      size="sm"
                      disabled={!isSlotAvailable(time)}
                      onClick={() => setBooking((prev) => ({ ...prev, time }))}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Call Method Selection */}
            {booking.time && (
              <div>
                <Label className="text-base font-medium">Choose Call Method</Label>
                <div className="space-y-3 mt-2">
                  {Object.entries(callMethods).map(([key, method]) => {
                    const Icon = method.icon
                    return (
                      <div
                        key={key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          booking.callMethod === key
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setBooking((prev) => ({ ...prev, callMethod: key as any }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{method.name}</span>
                          </div>
                          <Badge variant="secondary">${method.price}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {booking.callMethod && (
              <div>
                <Label className="text-base font-medium">Contact Information</Label>
                <div className="mt-2">{renderContactForm()}</div>
              </div>
            )}

            {/* Special Requests */}
            {booking.callMethod && (
              <div>
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special topics you'd like to discuss or questions you have..."
                  value={booking.specialRequests}
                  onChange={(e) => setBooking((prev) => ({ ...prev, specialRequests: e.target.value }))}
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.date && (
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{format(booking.date, "MMMM d, yyyy")}</span>
              </div>
            )}

            {booking.time && (
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">{booking.time}</span>
              </div>
            )}

            {booking.callMethod && (
              <>
                <div className="flex justify-between">
                  <span>Call Method:</span>
                  <span className="font-medium">{callMethods[booking.callMethod].name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">15 minutes</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${callMethods[booking.callMethod].price}</span>
                </div>
              </>
            )}

            <Button
              onClick={handleBooking}
              disabled={!booking.date || !booking.time || !booking.callMethod || isLoading}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Book Session"}
            </Button>

            <Alert>
              <AlertDescription className="text-sm">
                <strong>What to expect:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Personal 15-minute video call</li>
                  <li>• Direct conversation with Kelvin</li>
                  <li>• Ask questions, get advice, or just chat</li>
                  <li>• Professional and friendly environment</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

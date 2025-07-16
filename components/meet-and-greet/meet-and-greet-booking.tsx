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
import {
  CalendarDays,
  Clock,
  Phone,
  MessageSquare,
  Video,
  CheckCircle,
  ExternalLink,
  Shield,
  CreditCard,
  Users,
  Loader2,
} from "lucide-react"
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
  whatsapp: { name: "WhatsApp Video", price: 49.99, icon: Phone, color: "text-green-600" },
  signal: { name: "Signal Video", price: 54.99, icon: MessageSquare, color: "text-blue-600" },
  daily: { name: "Daily.co Video", price: 59.99, icon: Video, color: "text-purple-600" },
}

interface PaymentSuccessProps {
  sessionData: {
    callMethod: "whatsapp" | "signal" | "daily"
    sessionDate: Date
    timeSlot: string
    amount: number
    contactInfo: any
  }
  onClose: () => void
}

function PaymentSuccess({ sessionData, onClose }: PaymentSuccessProps) {
  const { callMethod, sessionDate, timeSlot, amount, contactInfo } = sessionData

  const handleProceedToCall = () => {
    if (callMethod === "whatsapp") {
      const phoneNumber = contactInfo?.phone?.replace(/\D/g, "") || "1234567890"
      const message = encodeURIComponent(
        `Hi Kelvin! I have a scheduled private session on ${format(sessionDate, "PPP")} at ${timeSlot}. Ready for our video call!`,
      )
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
    } else if (callMethod === "signal") {
      alert(
        `Please open Signal app and contact: +1 (234) 567-8900 or username: @kelvincrm for your scheduled session on ${format(sessionDate, "PPP")} at ${timeSlot}`,
      )
    } else if (callMethod === "daily") {
      window.open("/meet-and-greet?tab=live", "_blank")
    }
  }

  const getCallButtonText = () => {
    switch (callMethod) {
      case "whatsapp":
        return "Open WhatsApp Video Call"
      case "signal":
        return "Get Signal Contact Info"
      case "daily":
        return "Join Video Room"
      default:
        return "Proceed to Call"
    }
  }

  const getCallIcon = () => {
    const method = callMethods[callMethod]
    return method ? <method.icon className="h-4 w-4 mr-2" /> : null
  }

  return (
    <div className="space-y-6">
      {/* Success Confirmation */}
      <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-800 dark:text-green-200">Payment Successful!</CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            Your private session with Kelvin has been booked and confirmed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-background/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{format(sessionDate, "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{timeSlot} (15 minutes)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{callMethods[callMethod].name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">${amount.toFixed(2)} paid</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Rules & Guidelines */}
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-fire-600 dark:text-ice-400">
            <Shield className="h-5 w-5" />
            Video Call Guidelines
          </CardTitle>
          <CardDescription>Please read and follow these important guidelines for your session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-fire-500 dark:text-ice-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Be Punctual</div>
                  <div className="text-sm text-muted-foreground">
                    Be ready 5 minutes before your scheduled time. Session starts exactly at {timeSlot}.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-fire-500 dark:text-ice-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Video Required</div>
                  <div className="text-sm text-muted-foreground">
                    Keep your video on throughout the call. Ensure good lighting and stable internet.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-fire-500 dark:text-ice-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Respect Time Limits</div>
                  <div className="text-sm text-muted-foreground">
                    Your session is strictly 15 minutes. Please be mindful of time to respect other fans.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-fire-500 dark:text-ice-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Professional Conduct</div>
                  <div className="text-sm text-muted-foreground">
                    Keep the conversation respectful and appropriate. No recording or screenshots allowed.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Action */}
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-fire-600 dark:text-ice-400">
            {getCallIcon()}
            Ready for Your Call?
          </CardTitle>
          <CardDescription>Click the button below when it's time for your scheduled session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleProceedToCall}
            className="w-full bg-gradient-to-r from-fire-500 to-ice-500 hover:from-fire-600 hover:to-ice-600 text-white"
            size="lg"
          >
            {getCallIcon()}
            {getCallButtonText()}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>

          <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function MeetAndGreetBooking() {
  const [booking, setBooking] = useState<BookingData>({
    date: undefined,
    time: "",
    callMethod: "",
    contactInfo: {},
    specialRequests: "",
  })
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)

  const { user } = useAuth()

  // Check for successful payment on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentSuccess = urlParams.get("payment_success") === "true"
    const sessionId = urlParams.get("session_id")

    if (paymentSuccess && sessionId) {
      fetchSessionDetails(sessionId)
    }
  }, [])

  useEffect(() => {
    if (booking.date) {
      fetchBookedSlots(booking.date)
    }
  }, [booking.date])

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single()

      if (error) throw error

      setSessionData({
        callMethod: data.call_method,
        sessionDate: new Date(data.session_date),
        timeSlot: format(new Date(data.session_date), "HH:mm"),
        amount: data.amount_paid,
        contactInfo: data.contact_info,
      })
      setShowSuccess(true)
    } catch (error) {
      console.error("Error fetching session details:", error)
      toast.error("Could not load session details")
    }
  }

  const fetchBookedSlots = async (date: Date) => {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from("session_bookings")
        .select("session_date")
        .gte("session_date", startOfDay.toISOString())
        .lte("session_date", endOfDay.toISOString())
        .eq("status", "confirmed")

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

    if (isBefore(slotDateTime, now)) return false
    if (bookedSlots.includes(time)) return false

    return true
  }

  const isDateAvailable = (date: Date) => {
    const today = new Date()
    const maxDate = addDays(today, 30)

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

  if (showSuccess && sessionData) {
    return (
      <PaymentSuccess
        sessionData={sessionData}
        onClose={() => {
          setShowSuccess(false)
          setSessionData(null)
          window.history.replaceState({}, document.title, window.location.pathname)
        }}
      />
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

  const isFormValid = booking.date && booking.time && booking.callMethod
  const selectedMethodData = booking.callMethod ? callMethods[booking.callMethod] : null

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Book a Private Session</h1>
        <p className="text-muted-foreground">Get a personal 15-minute video call with Kelvin Creekman</p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Badge variant="secondary" className="bg-fire-500/10 dark:bg-ice-500/10">
            <Clock className="h-3 w-3 mr-1" />
            15 minutes
          </Badge>
          <Badge variant="secondary" className="bg-fire-500/10 dark:bg-ice-500/10">
            <Users className="h-3 w-3 mr-1" />
            1-on-1
          </Badge>
          <Badge variant="secondary" className="bg-fire-500/10 dark:bg-ice-500/10">
            From $49.99
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Your Session</CardTitle>
            <CardDescription>Choose your preferred date, time, and call method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-3">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={booking.date}
                onSelect={(date) => setBooking((prev) => ({ ...prev, date, time: "" }))}
                disabled={(date) => !isDateAvailable(date)}
                className="rounded-md border"
              />
              <p className="text-sm text-muted-foreground">Available dates: Today to 30 days ahead</p>
            </div>

            {/* Time Selection */}
            {booking.date && (
              <div className="space-y-3">
                <Label>Select Time</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const available = isSlotAvailable(time)
                    return (
                      <Button
                        key={time}
                        variant={booking.time === time ? "default" : "outline"}
                        size="sm"
                        disabled={!available}
                        onClick={() => setBooking((prev) => ({ ...prev, time }))}
                        className={
                          booking.time === time
                            ? "bg-fire-500 hover:bg-fire-600 dark:bg-ice-500 dark:hover:bg-ice-600"
                            : ""
                        }
                      >
                        {time}
                      </Button>
                    )
                  })}
                </div>
                <p className="text-sm text-muted-foreground">All times are in your local timezone</p>
              </div>
            )}

            {/* Call Method Selection */}
            {booking.time && (
              <div className="space-y-3">
                <Label>Choose Call Method</Label>
                <div className="space-y-3">
                  {Object.entries(callMethods).map(([key, method]) => {
                    const Icon = method.icon
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          booking.callMethod === key
                            ? "border-fire-500 bg-fire-50 dark:border-ice-500 dark:bg-ice-950"
                            : "border-border hover:border-fire-300 dark:hover:border-ice-300"
                        }`}
                        onClick={() => setBooking((prev) => ({ ...prev, callMethod: key as any }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${method.color}`} />
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-muted-foreground">15-minute video call</div>
                            </div>
                          </div>
                          <div className="text-lg font-bold">${method.price}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {booking.callMethod && renderContactForm()}

            {/* Special Requests */}
            {booking.callMethod && (
              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any topics you'd like to discuss or questions you have..."
                  value={booking.specialRequests}
                  onChange={(e) => setBooking((prev) => ({ ...prev, specialRequests: e.target.value }))}
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.date && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{format(booking.date, "PPP")}</span>
                </div>
              )}

              {booking.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.time} (15 minutes)</span>
                </div>
              )}

              {selectedMethodData && (
                <>
                  <div className="flex items-center gap-2">
                    <selectedMethodData.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMethodData.name}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${selectedMethodData.price}</span>
                  </div>
                </>
              )}

              <Button
                onClick={handleBooking}
                disabled={!isFormValid || isLoading}
                className="w-full bg-gradient-to-r from-fire-500 to-ice-500 hover:from-fire-600 hover:to-ice-600"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Book & Pay ${selectedMethodData?.price || "0.00"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Sessions are strictly 15 minutes. Please be punctual and ready with your questions.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-muted-foreground">
                <p>• No recording or screenshots allowed during the call</p>
                <p>• Refunds available up to 24 hours before your session</p>
                <p>• You'll receive confirmation and call details via email</p>
                <p>• Technical support available if you have connection issues</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

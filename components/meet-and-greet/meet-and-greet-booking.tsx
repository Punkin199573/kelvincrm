"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Video, MessageCircle, Shield, CheckCircle, CreditCard, CalendarIcon, ExternalLink } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { loadStripe } from "@stripe/stripe-js"
import React from "react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PrivateSession {
  id: string
  type: "whatsapp" | "signal" | "video"
  duration: number
  price: number
  description: string
  features: string[]
}

const privateSessions: PrivateSession[] = [
  {
    id: "whatsapp",
    type: "whatsapp",
    duration: 30,
    price: 150,
    description: "Private WhatsApp video call with Kelvin. Perfect for personal conversations and getting advice.",
    features: ["One-on-one with Kelvin", "WhatsApp video call", "30 minutes duration", "Flexible scheduling"],
  },
  {
    id: "signal",
    type: "signal",
    duration: 45,
    price: 200,
    description: "Exclusive Signal video session with Kelvin. High-quality, secure video call experience.",
    features: ["One-on-one with Kelvin", "Signal video call", "45 minutes duration", "End-to-end encrypted"],
  },
  {
    id: "video",
    type: "video",
    duration: 60,
    price: 300,
    description: "Premium private video session with screen sharing and recording included.",
    features: ["One-on-one with Kelvin", "Daily.co video call", "60 minutes duration", "Recording included"],
  },
]

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

export function MeetAndGreetBooking() {
  const [selectedPrivateSession, setSelectedPrivateSession] = useState<PrivateSession | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isBooking, setIsBooking] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    signalUsername: "",
    specialRequests: "",
  })
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [sessionBooking, setSessionBooking] = useState<any>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "whatsapp":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case "signal":
        return <Shield className="h-5 w-5 text-blue-500" />
      case "video":
        return <Video className="h-5 w-5 text-purple-500" />
      default:
        return <Video className="h-5 w-5" />
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleStripeCheckout = async () => {
    if (!selectedPrivateSession || !user || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a session type, date, time, and ensure you're logged in.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      })
      return
    }

    // Validate required contact info based on session type
    if (selectedPrivateSession.type === "whatsapp" && !formData.whatsappNumber) {
      toast({
        title: "WhatsApp Number Required",
        description: "Please provide your WhatsApp number for the session.",
        variant: "destructive",
      })
      return
    }

    if (selectedPrivateSession.type === "signal" && !formData.signalUsername) {
      toast({
        title: "Signal Username Required",
        description: "Please provide your Signal username for the session.",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      const response = await fetch("/api/create-session-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionType: selectedPrivateSession.type,
          sessionId: selectedPrivateSession.id,
          amount: selectedPrivateSession.price,
          duration: selectedPrivateSession.duration,
          scheduledDate: selectedDate.toISOString().split("T")[0],
          scheduledTime: selectedTime,
          userInfo: formData,
          userId: user.id,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      window.location.href = url
    } catch (error: any) {
      setIsBooking(false)
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      })
    }
  }

  // Check if we have a successful payment from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentSuccess = urlParams.get("payment") === "success"
    const sessionId = urlParams.get("session_id")

    if (paymentSuccess && sessionId) {
      // Fetch session details and show success
      fetchSessionDetails(sessionId)
    }
  }, [])

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single()

      if (error) throw error

      setSessionBooking(data)
      setPaymentStatus("success")

      // Find the session type
      const session = privateSessions.find((s) => s.type === data.session_type)
      setSelectedPrivateSession(session || null)
    } catch (error) {
      console.error("Error fetching session details:", error)
    }
  }

  if (paymentStatus === "success" && sessionBooking) {
    return (
      <PaymentSuccessCard
        sessionBooking={sessionBooking}
        selectedSession={selectedPrivateSession}
        getSessionIcon={getSessionIcon}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Private Session Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {privateSessions.map((session, index) => (
          <Card
            key={session.id}
            className={`cursor-pointer transition-all border-2 ${
              selectedPrivateSession?.id === session.id
                ? "border-electric-500 bg-electric-500/10 shadow-lg"
                : "border-electric-700/30 hover:border-electric-500/50 hover:shadow-md"
            }`}
            onClick={() => setSelectedPrivateSession(session)}
          >
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">{getSessionIcon(session.type)}</div>
              <CardTitle className="capitalize">{session.type} Session</CardTitle>
              <CardDescription className="text-2xl font-bold text-electric-400">${session.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge className="mb-2">{session.duration} minutes</Badge>
              </div>
              <p className="text-sm text-muted-foreground text-center">{session.description}</p>

              <div className="space-y-2">
                {session.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date and Time Selection */}
      {selectedPrivateSession && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <Card className="border-electric-700/30 bg-background/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-electric-400">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
              <CardDescription>Choose your preferred date for the session</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date > new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)}
                className="rounded-md border border-electric-700/30"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="border-electric-700/30 bg-background/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-electric-400">
                <Clock className="h-5 w-5" />
                Select Time
              </CardTitle>
              <CardDescription>Choose your preferred time slot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className={selectedTime === time ? "bg-electric-500 hover:bg-electric-600" : ""}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {selectedTime && (
                <div className="mt-4 p-3 bg-electric-500/10 rounded-lg">
                  <p className="text-sm">
                    <strong>Selected:</strong> {selectedDate?.toLocaleDateString()} at {selectedTime}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Private Session Form */}
      {selectedPrivateSession && selectedDate && selectedTime && (
        <Card className="border-electric-700/30 bg-background/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-electric-400">
              {getSessionIcon(selectedPrivateSession.type)}
              Complete Your Booking
            </CardTitle>
            <CardDescription>Fill in your details to complete the booking and payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="private-name">Full Name</Label>
                <Input
                  id="private-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="border-electric-700/30 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="private-email">Email Address</Label>
                <Input
                  id="private-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="border-electric-700/30 bg-background/50"
                />
              </div>
            </div>

            {selectedPrivateSession.type === "whatsapp" && (
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number (with country code)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="border-electric-700/30 bg-background/50"
                />
              </div>
            )}

            {selectedPrivateSession.type === "signal" && (
              <div className="space-y-2">
                <Label htmlFor="signal">Signal Username</Label>
                <Input
                  id="signal"
                  value={formData.signalUsername}
                  onChange={(e) => handleInputChange("signalUsername", e.target.value)}
                  placeholder="@yourusername"
                  className="border-electric-700/30 bg-background/50"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="private-requests">Special Requests or Topics</Label>
              <Textarea
                id="private-requests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                placeholder="What would you like to discuss with Kelvin? Any specific topics or questions?"
                className="border-electric-700/30 bg-background/50"
                rows={4}
              />
            </div>

            <div className="p-4 rounded-lg bg-electric-500/10 border border-electric-500/30">
              <h4 className="font-semibold mb-2">Booking Summary:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 capitalize">{selectedPrivateSession.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="ml-2">{selectedPrivateSession.duration} minutes</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2">{selectedDate.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>
                  <span className="ml-2">{selectedTime}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="ml-2 font-semibold text-electric-400">${selectedPrivateSession.price}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStripeCheckout}
              disabled={isBooking || !user}
              className="w-full bg-gradient-electric hover:animate-electric-pulse"
              size="lg"
            >
              {isBooking ? (
                "Processing..."
              ) : user ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${selectedPrivateSession.price} & Book Session
                </>
              ) : (
                "Sign In to Book"
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Payment Success Component
function PaymentSuccessCard({
  sessionBooking,
  selectedSession,
  getSessionIcon,
}: {
  sessionBooking: any
  selectedSession: PrivateSession | null
  getSessionIcon: any
}) {
  const { toast } = useToast()

  const handleSignalContact = () => {
    const signalNumber = "+1234567890" // Replace with actual Signal number
    toast({
      title: "Signal Contact Info",
      description: `Open Signal and message/call: ${signalNumber}`,
    })
  }

  const handleWhatsAppCall = () => {
    const whatsappNumber = "1234567890" // Replace with actual WhatsApp number
    const message = encodeURIComponent(
      `Hi Kelvin! I've just booked a ${selectedSession?.type} session for ${sessionBooking.scheduled_date} at ${sessionBooking.scheduled_time}. Looking forward to our call!`,
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleVideoCall = () => {
    // This would redirect to the Daily.co room or video call platform
    const videoUrl = sessionBooking.video_call_url || "/meet-and-greet?tab=live"
    window.open(videoUrl, "_blank")
  }

  const getCallButton = () => {
    switch (selectedSession?.type) {
      case "signal":
        return (
          <Button onClick={handleSignalContact} className="w-full bg-blue-500 hover:bg-blue-600">
            <Shield className="h-4 w-4 mr-2" />
            Contact via Signal
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )
      case "whatsapp":
        return (
          <Button onClick={handleWhatsAppCall} className="w-full bg-green-500 hover:bg-green-600">
            <MessageCircle className="h-4 w-4 mr-2" />
            Start WhatsApp Video Call
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )
      case "video":
        return (
          <Button onClick={handleVideoCall} className="w-full bg-purple-500 hover:bg-purple-600">
            <Video className="h-4 w-4 mr-2" />
            Join Video Call
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Confirmation */}
      <Card className="border-green-500/30 bg-green-500/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-green-400">Payment Successful!</CardTitle>
          <CardDescription>Your private session has been confirmed and paid for.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-background/50">
              <div className="font-semibold">Session Type</div>
              <div className="text-sm text-muted-foreground capitalize">{selectedSession?.type}</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <div className="font-semibold">Duration</div>
              <div className="text-sm text-muted-foreground">{selectedSession?.duration} minutes</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <div className="font-semibold">Date</div>
              <div className="text-sm text-muted-foreground">{sessionBooking.scheduled_date}</div>
            </div>
            <div className="p-3 rounded-lg bg-background/50">
              <div className="font-semibold">Time</div>
              <div className="text-sm text-muted-foreground">{sessionBooking.scheduled_time}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Rules */}
      <Card className="border-electric-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Call Rules & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-electric-400 mt-0.5" />
              <div>
                <div className="font-medium">Respect Time Limits</div>
                <div className="text-sm text-muted-foreground">
                  Your session is {selectedSession?.duration} minutes. Please be mindful of time.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-electric-400 mt-0.5" />
              <div>
                <div className="font-medium">Video Only</div>
                <div className="text-sm text-muted-foreground">Please keep your video on during the call.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-electric-400 mt-0.5" />
              <div>
                <div className="font-medium">Be Punctual</div>
                <div className="text-sm text-muted-foreground">Be ready 5 minutes before your scheduled time.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-electric-400 mt-0.5" />
              <div>
                <div className="font-medium">Respectful Interaction</div>
                <div className="text-sm text-muted-foreground">Keep the conversation respectful and appropriate.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Button */}
      <Card className="border-electric-700/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-electric-400">
            {selectedSession && getSessionIcon(selectedSession.type)}
            Ready for Your Call?
          </CardTitle>
          <CardDescription>Click the button below when it's time for your scheduled session</CardDescription>
        </CardHeader>
        <CardContent>{getCallButton()}</CardContent>
      </Card>
    </div>
  )
}

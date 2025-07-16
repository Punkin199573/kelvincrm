"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, Video, MessageCircle, Phone, Loader2, CheckCircle, Users } from "lucide-react"
import { format } from "date-fns"

type CallMethod = "whatsapp" | "signal" | "daily"

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
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
]

const callMethods = [
  {
    id: "whatsapp" as CallMethod,
    name: "WhatsApp Video",
    icon: MessageCircle,
    description: "Video call via WhatsApp",
    color: "text-green-600",
  },
  {
    id: "signal" as CallMethod,
    name: "Signal Call",
    icon: Phone,
    description: "Secure call via Signal",
    color: "text-blue-600",
  },
  {
    id: "daily" as CallMethod,
    name: "Daily.co Room",
    icon: Video,
    description: "Browser-based video call",
    color: "text-purple-600",
  },
]

interface PaymentSuccessProps {
  callMethod: CallMethod
  sessionDate: Date
  timeSlot: string
  onClose: () => void
}

function PaymentSuccess({ callMethod, sessionDate, timeSlot, onClose }: PaymentSuccessProps) {
  const handleProceedToCall = () => {
    const method = callMethods.find((m) => m.id === callMethod)

    if (callMethod === "whatsapp") {
      const message = encodeURIComponent(
        `Hi Kelvin! I have a scheduled private session on ${format(sessionDate, "PPP")} at ${timeSlot}. Ready for our video call!`,
      )
      window.open(`https://wa.me/1234567890?text=${message}`, "_blank")
    } else if (callMethod === "signal") {
      // Signal doesn't support deep links, show instructions
      alert("Please open Signal app and contact: +1 (234) 567-8900 or username: @kelvincrm")
    } else if (callMethod === "daily") {
      // This would redirect to the Daily.co room
      window.open("/meet-and-greet?tab=live", "_blank")
    }
  }

  const getCallButtonText = () => {
    switch (callMethod) {
      case "whatsapp":
        return "Open WhatsApp"
      case "signal":
        return "Get Signal Info"
      case "daily":
        return "Join Video Room"
      default:
        return "Proceed to Call"
    }
  }

  return (
    <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-green-800 dark:text-green-200">Payment Successful!</CardTitle>
        <CardDescription className="text-green-600 dark:text-green-400">
          Your private session with Kelvin has been booked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Details */}
        <div className="rounded-lg bg-background/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{format(sessionDate, "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{timeSlot} (15 minutes)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-muted-foreground" />
            <span>{callMethods.find((m) => m.id === callMethod)?.name}</span>
          </div>
        </div>

        {/* Call Rules */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Video Call Guidelines:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Be punctual - session starts exactly at scheduled time</li>
            <li>• Keep video on throughout the call</li>
            <li>• Session duration is strictly 15 minutes</li>
            <li>• Be respectful and professional</li>
            <li>• Have good lighting and stable internet</li>
            <li>• No recording or screenshots allowed</li>
          </ul>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleProceedToCall}
            className="w-full bg-gradient-fire dark:bg-gradient-ice hover:opacity-90"
          >
            {getCallButtonText()}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function MeetAndGreetBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedMethod, setSelectedMethod] = useState<CallMethod>()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session.",
        variant: "destructive",
      })
      return
    }

    if (!selectedDate || !selectedTime || !selectedMethod) {
      toast({
        title: "Missing information",
        description: "Please select date, time, and call method.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/create-session-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionDate: selectedDate.toISOString(),
          timeSlot: selectedTime,
          callMethod: selectedMethod,
          amount: 50.0, // $50 for private session
        }),
      })

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url
      }
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if we're returning from successful payment
  const urlParams = new URLSearchParams(window.location.search)
  const paymentSuccess = urlParams.get("payment_success") === "true"

  if (paymentSuccess && !showSuccess) {
    setShowSuccess(true)
  }

  if (showSuccess && selectedDate && selectedTime && selectedMethod) {
    return (
      <PaymentSuccess
        callMethod={selectedMethod}
        sessionDate={selectedDate}
        timeSlot={selectedTime}
        onClose={() => setShowSuccess(false)}
      />
    )
  }

  const isFormValid = selectedDate && selectedTime && selectedMethod

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-fire-500/20 dark:border-ice-500/20">
        <CardHeader className="text-center">
          <CardTitle className="text-fire-600 dark:text-ice-400">Book Private Session</CardTitle>
          <CardDescription>Get a personal 15-minute video call with Kelvin Creekman</CardDescription>
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
              $50.00
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time & Method Selection */}
        <div className="space-y-6">
          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Call Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="h-5 w-5" />
                Call Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {callMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div
                    key={method.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? "border-fire-500 dark:border-ice-500 bg-fire-50 dark:bg-ice-950/20"
                        : "border-border hover:border-fire-300 dark:hover:border-ice-300"
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${method.color}`} />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Summary & Action */}
      {isFormValid && (
        <Card className="border-fire-500/20 dark:border-ice-500/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Booking Summary</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{selectedDate && format(selectedDate, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{selectedTime} (15 minutes)</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span>{callMethods.find((m) => m.id === selectedMethod)?.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>$50.00</span>
                </div>
              </div>
              <Button
                onClick={handleBookSession}
                disabled={isLoading}
                className="w-full bg-gradient-fire dark:bg-gradient-ice hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Book Session - $50.00"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

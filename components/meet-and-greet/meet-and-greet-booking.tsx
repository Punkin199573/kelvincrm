"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Clock, Video, Shield, CreditCard, Users, Loader2, Crown } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase, type MeetGreetSession } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BookingData {
  sessionId: string
  contactInfo: {
    phone?: string
    username?: string
    email?: string
  }
  specialRequests: string
}

export function MeetAndGreetBooking() {
  const [sessions, setSessions] = useState<MeetGreetSession[]>([])
  const [selectedSession, setSelectedSession] = useState<MeetGreetSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [booking, setBooking] = useState<BookingData>({
    sessionId: "",
    contactInfo: {},
    specialRequests: "",
  })

  const { user, profile } = useAuth()

  useEffect(() => {
    fetchAvailableSessions()
  }, [])

  const fetchAvailableSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("meet_greet_sessions")
        .select("*")
        .eq("is_active", true)
        .gte("session_date", new Date().toISOString())
        .order("session_date", { ascending: true })

      if (error) throw error

      setSessions(data || [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to load available sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const canUserJoinSession = (session: MeetGreetSession) => {
    if (!user || !profile) return false

    const tierHierarchy = {
      frost_fan: 1,
      blizzard_vip: 2,
      avalanche_backstage: 3,
    }

    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = tierHierarchy[session.required_tier] || 0

    return userTierLevel >= requiredTierLevel
  }

  const handleSessionSelect = (session: MeetGreetSession) => {
    setSelectedSession(session)
    setBooking((prev) => ({
      ...prev,
      sessionId: session.id,
      contactInfo: { email: user?.email || "" },
    }))
  }

  const handleBooking = async () => {
    if (!user || !selectedSession) {
      toast.error("Please log in to book a session")
      return
    }

    if (!canUserJoinSession(selectedSession)) {
      toast.error("Your membership tier is not high enough for this session")
      return
    }

    if (selectedSession.current_participants >= selectedSession.max_participants) {
      toast.error("This session is already full")
      return
    }

    if (!booking.contactInfo.email) {
      toast.error("Email is required for booking")
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
          sessionId: selectedSession.id,
          sessionDate: selectedSession.session_date,
          sessionType: selectedSession.session_type,
          contactInfo: booking.contactInfo,
          specialRequests: booking.specialRequests,
          price: selectedSession.price,
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
      setIsBooking(false)
    }
  }

  const getTierBadge = (tier: string) => {
    const tierConfig = {
      frost_fan: { label: "Frost Fan", color: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
      blizzard_vip: { label: "Blizzard VIP", color: "bg-purple-500/20 text-purple-400 border-purple-500/50" },
      avalanche_backstage: { label: "Avalanche Backstage", color: "bg-gold-500/20 text-gold-400 border-gold-500/50" },
    }

    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.frost_fan

    return (
      <Badge className={config.color}>
        <Crown className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Meet & Greet Sessions</CardTitle>
            <CardDescription>Please log in to book a video session with Kelvin Creekman</CardDescription>
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Meet & Greet Sessions</h1>
        <p className="text-muted-foreground">Join upcoming video sessions with Kelvin Creekman</p>
      </div>

      {!selectedSession ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No sessions available</p>
                  <p className="text-sm text-muted-foreground">Check back later for new sessions!</p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => {
                const canJoin = canUserJoinSession(session)
                const isFull = session.current_participants >= session.max_participants
                const sessionDate = new Date(session.session_date)

                return (
                  <Card
                    key={session.id}
                    className={`${canJoin && !isFull ? "hover:shadow-lg transition-shadow cursor-pointer" : "opacity-60"}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{session.title}</h3>
                          {session.description && (
                            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getTierBadge(session.required_tier)}
                          <Badge variant="outline" className="capitalize">
                            {session.session_type}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>{format(sessionDate, "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(sessionDate, "p")} ({session.duration_minutes}min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {session.current_participants}/{session.max_participants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">${session.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isFull && <Badge variant="destructive">Full</Badge>}
                          {!canJoin && <Badge variant="secondary">Upgrade Required</Badge>}
                        </div>
                        <Button
                          onClick={() => handleSessionSelect(session)}
                          disabled={!canJoin || isFull}
                          className="bg-gradient-to-r from-primary to-primary/80"
                        >
                          {canJoin && !isFull ? "Select Session" : "Unavailable"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Review your selected session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedSession.title}</h3>
                {selectedSession.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedSession.description}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(selectedSession.session_date), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedSession.session_date), "p")} ({selectedSession.duration_minutes} minutes)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedSession.current_participants}/{selectedSession.max_participants} participants
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{selectedSession.session_type} Session</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>${selectedSession.price}</span>
              </div>

              <Button variant="outline" onClick={() => setSelectedSession(null)} className="w-full">
                Choose Different Session
              </Button>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>Provide your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <p className="text-sm text-muted-foreground">We'll send session details and reminders to this email</p>
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
                <Label htmlFor="requests">Special Requests (optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any topics you'd like to discuss or questions you have..."
                  value={booking.specialRequests}
                  onChange={(e) => setBooking((prev) => ({ ...prev, specialRequests: e.target.value }))}
                  rows={3}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Sessions are recorded for quality purposes. By booking, you agree to our terms of service.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleBooking}
                disabled={isBooking || !booking.contactInfo.email}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
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
                    Book & Pay ${selectedSession.price}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

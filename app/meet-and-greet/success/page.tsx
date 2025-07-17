"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Clock,
  Video,
  MessageSquare,
  Download,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"

interface SessionDetails {
  sessionDate: string
  sessionTime: string
  sessionType: string
  duration: string
  price: string
  contactInfo: any
  specialRequests?: string
}

export default function MeetAndGreetSuccessPage() {
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId && user) {
      fetchSessionDetails()
    }
  }, [sessionId, user])

  const fetchSessionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .eq("user_id", user?.id)
        .single()

      if (error) throw error

      if (data) {
        setSessionDetails({
          sessionDate: new Date(data.session_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          sessionTime: data.session_time,
          sessionType: data.session_type,
          duration: `${data.duration_minutes} minutes`,
          price: `$${data.amount_paid.toFixed(2)}`,
          contactInfo: data.contact_info,
          specialRequests: data.special_requests,
        })
      }
    } catch (error) {
      console.error("Error fetching session details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignalCall = () => {
    // Placeholder for your custom Signal meeting link
    // Replace this URL with your actual Signal meeting link
    window.open("https://signal.org/call/your-custom-meeting-link", "_blank")
  }

  const handleDownloadSignal = () => {
    window.open("https://signal.org/download/", "_blank")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your session details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <Card className="max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>Unable to find your session details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">Session Booked Successfully!</CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Your private video session with Kelvin Creekman has been confirmed
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Session Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="font-semibold">{sessionDetails.sessionDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time</p>
                  <p className="font-semibold">{sessionDetails.sessionTime} EST</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="font-semibold">{sessionDetails.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount Paid</p>
                  <p className="font-semibold">{sessionDetails.price}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Session Type</p>
                <Badge variant="secondary" className="text-sm">
                  <Video className="h-3 w-3 mr-1" />
                  {sessionDetails.sessionType}
                </Badge>
              </div>

              {sessionDetails.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Your Topics/Questions</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{sessionDetails.specialRequests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{sessionDetails.contactInfo.email}</span>
              </div>
              {sessionDetails.contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{sessionDetails.contactInfo.phone}</span>
                </div>
              )}

              <Separator />

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  You'll receive a reminder email 24 hours before your session with detailed instructions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Video Call Instructions & Guidelines
            </CardTitle>
            <CardDescription>Please read these important guidelines before your session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Before Your Session</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Download and set up Signal app on your device</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Test your camera and microphone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Find a quiet, well-lit space for the call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Prepare any questions you'd like to ask</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Join the call 2-3 minutes early</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">During Your Session</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Be respectful and professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Keep the conversation positive and engaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Feel free to ask about music, career, or personal interests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Recording is not permitted without prior consent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Enjoy this exclusive opportunity!</span>
                  </li>
                </ul>
              </div>
            </div>

            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <MessageSquare className="h-4 w-4" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> This session will be conducted via Signal for maximum privacy and security.
                Please ensure you have the Signal app installed and ready before your scheduled time.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleSignalCall} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <MessageSquare className="h-5 w-5 mr-2" />
            Proceed to Video Call via Signal
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>

          <Button onClick={handleDownloadSignal} variant="outline" size="lg">
            <Download className="h-5 w-5 mr-2" />
            Download Signal App
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-2">Need help or have questions about your session?</p>
            <p className="text-sm">
              Contact us at{" "}
              <a href="mailto:support@kelvincreekman.com" className="text-primary hover:underline">
                support@kelvincreekman.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

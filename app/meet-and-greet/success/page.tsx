"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Video, Download, Clock, Calendar, Shield, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase/client"

export default function MeetAndGreetSuccessPage() {
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { user } = useAuth()

  useEffect(() => {
    if (user && sessionId) {
      verifyPaymentAndAccess()
    }
  }, [user, sessionId])

  const verifyPaymentAndAccess = async () => {
    try {
      // Check if user has a valid paid session for this Stripe session
      const { data: booking, error } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("user_id", user?.id)
        .eq("stripe_session_id", sessionId)
        .eq("status", "confirmed")
        .single()

      if (error || !booking) {
        console.error("No valid booking found:", error)
        setHasAccess(false)
        setLoading(false)
        return
      }

      setSessionDetails(booking)
      setHasAccess(true)
    } catch (error) {
      console.error("Error verifying access:", error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSignalRedirect = () => {
    // This will be replaced with your custom Signal meeting link
    const signalMeetingLink = "https://signal.org/install" // Placeholder - replace with your custom link
    window.open(signalMeetingLink, "_blank")
  }

  const handleDownloadSignal = () => {
    window.open("https://signal.org/install", "_blank")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">Please log in to access your session details.</p>
              <Button onClick={() => (window.location.href = "/login")} className="mt-4">
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!hasAccess || !sessionDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                You don't have access to this session. Please ensure you've completed payment for a valid booking.
              </p>
              <Button onClick={() => (window.location.href = "/meet-and-greet")} variant="outline">
                Book a Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-6 w-6" />
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-green-600">
              Your meet & greet session with Kelvin has been confirmed
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date:</span>
                <span>{new Date(sessionDetails.session_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time:</span>
                <span>{sessionDetails.session_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Duration:</span>
                <span>{sessionDetails.duration_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Platform:</span>
                <Badge variant="outline">Signal</Badge>
              </div>
            </div>

            {sessionDetails.special_requests && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Your Special Requests:</h4>
                <p className="text-blue-800">{sessionDetails.special_requests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Video Call Instructions
            </CardTitle>
            <CardDescription>Please read these important guidelines before your session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Before Your Session:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Ensure you have Signal installed on your device (download link provided below)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Test your camera and microphone beforehand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Find a quiet, well-lit space for the best experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Prepare any questions or topics you'd like to discuss with Kelvin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Join the call 2-3 minutes before your scheduled time</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">During Your Session:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Be respectful and courteous throughout the conversation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Recording is not permitted without explicit permission</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Keep the conversation appropriate and family-friendly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>If you experience technical issues, try refreshing or rejoining the call</span>
                </li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Sessions are private and confidential</li>
                  <li>• Please be punctual - late arrivals may result in shortened session time</li>
                  <li>• For rescheduling, contact support at least 24 hours in advance</li>
                  <li>• Technical support is available if needed</li>
                </ul>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleSignalRedirect}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Video className="h-5 w-5 mr-2" />
                Proceed to Video Call via Signal
              </Button>

              <Button
                onClick={handleDownloadSignal}
                variant="outline"
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Signal App
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Need help? Contact us at{" "}
              <a href="mailto:support@kelvincreekman.com" className="text-blue-600 hover:underline">
                support@kelvincreekman.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

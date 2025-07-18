"use client"

import { useState } from "react"
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
  ExternalLink,
  Smartphone,
} from "lucide-react"

// IMPORTANT: Replace this URL with your actual Signal call link
const SIGNAL_CALL_URL = "https://signal.link/call/#key=rkdp-mzpg-xhts-dsqp-sfqx-bbbt-gbpb-qfqx"

export default function MeetAndGreetSuccessPage() {
  const [sessionDetails, setSessionDetails] = useState({
    sessionDate: "March 15, 2024",
    sessionTime: "2:00 PM EST",
    sessionType: "Private Video Call",
    duration: "30 minutes",
    price: "$99.99",
    contactInfo: {
      email: "user@example.com",
      phone: "+1 (555) 123-4567",
    },
    specialRequests: "Looking forward to discussing music production techniques",
  })

  const handleSignalCall = () => {
    // This will redirect to your Signal call link
    window.open(SIGNAL_CALL_URL, "_blank")
  }

  const handleDownloadSignal = () => {
    window.open("https://signal.org/download/", "_blank")
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
                  <p className="font-semibold">{sessionDetails.sessionTime}</p>
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

        {/* Signal Call Instructions */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Smartphone className="h-5 w-5" />
              Signal Video Call Instructions
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Your session will be conducted via Signal for maximum privacy and security
            </CardDescription>
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
            Proceed to Signal Video Call
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
                support@livwithcreekman.vip
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

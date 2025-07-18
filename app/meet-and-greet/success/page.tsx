"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, Clock, Video, Download, Phone, MessageCircle } from "lucide-react"

// Replace this URL with your actual Signal call link
const SIGNAL_CALL_URL = "https://signal.link/call/#key=rkdp-mzpg-xhts-dsqp-sfqx-bbbt-gbpb-qfqx"

export default function MeetAndGreetSuccessPage() {
  const searchParams = useSearchParams()
  const [sessionDetails, setSessionDetails] = useState<any>(null)

  useEffect(() => {
    // Get session details from URL params or localStorage
    const sessionId = searchParams.get("session_id")
    const sessionData = localStorage.getItem("meetGreetSession")

    if (sessionData) {
      setSessionDetails(JSON.parse(sessionData))
    }
  }, [searchParams])

  const handleJoinCall = () => {
    window.open(SIGNAL_CALL_URL, "_blank")
  }

  const handleDownloadSignal = () => {
    window.open("https://signal.org/download/", "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your meet & greet session with Kelvin Creekman has been successfully booked.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionDetails && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date & Time:</span>
                  <span className="font-semibold">
                    {new Date(sessionDetails.session_date).toLocaleDateString()} at {sessionDetails.session_time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-semibold">30 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Session Type:</span>
                  <Badge variant="secondary">Private Video Call</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Join Your Signal Video Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Before Your Call:</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Make sure you have Signal app installed on your device</li>
                <li>• Test your camera and microphone</li>
                <li>• Find a quiet, well-lit space for the call</li>
                <li>• Join the call 2-3 minutes before your scheduled time</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Call Instructions:
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Click "Proceed to Signal Video Call" when ready</li>
                <li>• You'll be redirected to the Signal call link</li>
                <li>• If prompted, allow Signal to access your camera and microphone</li>
                <li>• Wait for Kelvin to join the call at your scheduled time</li>
              </ul>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleJoinCall} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Proceed to Signal Video Call
              </Button>

              <Button onClick={handleDownloadSignal} variant="outline" className="flex-1 bg-transparent" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download Signal App
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have Signal? Download it first, then return to join your call.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Check Your Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You'll receive a confirmation email with all the details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Prepare for Your Call</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Install Signal and test your setup before the scheduled time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Join at Your Scheduled Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the call button above when it's time for your session.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

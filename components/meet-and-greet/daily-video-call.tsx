"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Crown, Shield } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface DailyVideoCallProps {
  sessionId?: string
  roomUrl?: string
  onLeave?: () => void
}

export function DailyVideoCall({ sessionId, roomUrl, onLeave }: DailyVideoCallProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [sessionDetails, setSessionDetails] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const { user, profile } = useAuth()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (user && profile) {
      setIsAdmin(profile.is_admin)
      checkValidSession()
    }
  }, [user, profile])

  const checkValidSession = async () => {
    if (!user) return

    try {
      // Check if user has a valid paid session
      const { data: sessions, error } = await supabase
        .from("session_bookings")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "confirmed")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within last 24 hours

      if (error) throw error

      if (sessions && sessions.length > 0) {
        setHasValidSession(true)
        setSessionDetails(sessions[0])
      } else if (profile?.is_admin) {
        // Admin always has access
        setHasValidSession(true)
      } else {
        setHasValidSession(false)
      }
    } catch (error) {
      console.error("Error checking session validity:", error)
      setHasValidSession(false)
    }
  }

  const handleJoinCall = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to join the video call.",
        variant: "destructive",
      })
      return
    }

    if (!hasValidSession && !isAdmin) {
      toast({
        title: "Payment Required",
        description: "Please complete payment for a private session to access live calls.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      // Simulate Daily.co connection with 1-on-1 restriction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if there's already an active session (for 1-on-1 enforcement)
      const { data: activeSessions, error } = await supabase
        .from("active_video_sessions")
        .select("*")
        .eq("session_id", sessionId || "default")

      if (error) throw error

      // If there are already 2 participants (admin + user), don't allow more
      if (activeSessions && activeSessions.length >= 2 && !isAdmin) {
        throw new Error("Session is full. Only 1-on-1 sessions are allowed.")
      }

      // Add user to active session
      await supabase.from("active_video_sessions").insert({
        session_id: sessionId || "default",
        user_id: user.id,
        is_admin: isAdmin,
        joined_at: new Date().toISOString(),
      })

      setIsConnected(true)
      toast({
        title: "Connected! 🎸",
        description: "You've joined the private video session with Kelvin.",
      })

      // Simulate getting user media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (error) {
          console.error("Error accessing media devices:", error)
        }
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to join the video call. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLeaveCall = async () => {
    try {
      // Remove user from active session
      await supabase
        .from("active_video_sessions")
        .delete()
        .eq("session_id", sessionId || "default")
        .eq("user_id", user?.id)

      setIsConnected(false)
      toast({
        title: "Left Session",
        description: "You've left the video session.",
      })
      onLeave?.()
    } catch (error) {
      console.error("Error leaving session:", error)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    toast({
      title: isMuted ? "Unmuted" : "Muted",
      description: `Your microphone is now ${isMuted ? "on" : "off"}.`,
    })
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    toast({
      title: isVideoOn ? "Video Off" : "Video On",
      description: `Your camera is now ${isVideoOn ? "off" : "on"}.`,
    })
  }

  if (!hasValidSession && !isAdmin) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Shield className="h-5 w-5" />
            Payment Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-400 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Private Session Access Only</h3>
            <p className="text-muted-foreground mb-6">
              Live video calls are exclusive to users who have completed payment for a private session.
            </p>
          </div>

          <Button
            onClick={() => (window.location.href = "/meet-and-greet?tab=book")}
            className="bg-gradient-electric hover:animate-electric-pulse"
            size="lg"
          >
            <Shield className="h-4 w-4 mr-2" />
            Book & Pay for Private Session
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card className="border-electric-700/30 bg-background/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-electric-400">
            <Video className="h-5 w-5" />
            <Shield className="h-4 w-4 text-green-500" />
            Private Video Session
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <Video className="h-16 w-16 mx-auto mb-4 text-electric-400 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Ready for your private session?</h3>
            <p className="text-muted-foreground mb-6">
              {isAdmin
                ? "Join the private video session as admin."
                : "Connect with Kelvin Creekman in your exclusive 1-on-1 video session."}
            </p>
            {sessionDetails && (
              <div className="mb-6 p-4 bg-electric-500/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Session Type:</div>
                <div className="font-semibold capitalize">{sessionDetails.session_type}</div>
                <div className="text-sm text-muted-foreground mt-2">Duration:</div>
                <div className="font-semibold">{sessionDetails.session_duration} minutes</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className={isMuted ? "bg-red-500/20 border-red-500/50" : ""}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVideo}
              className={!isVideoOn ? "bg-red-500/20 border-red-500/50" : ""}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </div>

          <Button
            onClick={handleJoinCall}
            disabled={isConnecting}
            className="bg-gradient-electric hover:animate-electric-pulse"
            size="lg"
          >
            {isConnecting ? "Connecting..." : "Join Private Video Call"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1-on-1 Video Interface */}
      <Card className="border-electric-700/30 bg-background/50 backdrop-blur-lg">
        <CardContent className="p-0 h-[600px] relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 h-full">
            {/* Admin Video (Kelvin) */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video autoPlay muted className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-electric-500/50">
                  <AvatarImage src="/kelvin-logo.png" alt="Kelvin Creekman" />
                  <AvatarFallback className="bg-electric-500/20 text-electric-400">KC</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-gold-400" />
                  <span className="text-white font-semibold">Kelvin Creekman</span>
                </div>
              </div>
            </div>

            {/* User Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-electric-500/50">
                  <AvatarFallback className="bg-electric-500/20 text-electric-400">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white font-semibold">
                  {profile?.full_name || user?.email?.split("@")[0] || "You"}
                </span>
                {isMuted && <MicOff className="h-3 w-3 text-red-400" />}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-lg rounded-full px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className={`rounded-full ${isMuted ? "bg-red-500 hover:bg-red-600" : "hover:bg-white/20"}`}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVideo}
              className={`rounded-full ${!isVideoOn ? "bg-red-500 hover:bg-red-600" : "hover:bg-white/20"}`}
            >
              {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveCall}
              className="rounded-full bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card className="border-electric-700/30 bg-background/50 backdrop-blur-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-semibold">Private 1-on-1 Session</div>
                <div className="text-sm text-muted-foreground">
                  {sessionDetails ? `${sessionDetails.session_duration} minutes` : "Exclusive session"}
                </div>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              LIVE
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

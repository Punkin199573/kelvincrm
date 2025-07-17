"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Video, Calendar, Clock, DollarSign, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, type SessionSlot } from "@/lib/supabase/client"

const sessionTypes = [
  { value: "video_call", label: "Video Call", icon: Video },
  { value: "phone_call", label: "Phone Call", icon: Calendar },
  { value: "meet_greet", label: "Meet & Greet", icon: Clock },
]

export function AdminSessionManagement() {
  const [sessions, setSessions] = useState<SessionSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionSlot | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    session_type: "video_call",
    session_date: "",
    duration_minutes: 30,
    price: 50,
    max_bookings: 1,
    description: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("session_slots")
        .select("*")
        .order("session_date", { ascending: true })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch session slots",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.session_date) {
      toast({
        title: "Validation Error",
        description: "Session date is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const sessionData = {
        session_type: formData.session_type,
        session_date: new Date(formData.session_date).toISOString(),
        duration_minutes: formData.duration_minutes,
        price: formData.price,
        max_bookings: formData.max_bookings,
        description: formData.description || null,
        is_available: true,
        current_bookings: 0,
      }

      if (editingSession) {
        const { error } = await supabase.from("session_slots").update(sessionData).eq("id", editingSession.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Session slot updated successfully",
        })
      } else {
        const { error } = await supabase.from("session_slots").insert([sessionData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Session slot created successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchSessions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save session slot",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (session: SessionSlot) => {
    setEditingSession(session)
    setFormData({
      session_type: session.session_type,
      session_date: new Date(session.session_date).toISOString().slice(0, 16),
      duration_minutes: session.duration_minutes,
      price: session.price,
      max_bookings: session.max_bookings,
      description: session.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session slot?")) return

    try {
      const { error } = await supabase.from("session_slots").delete().eq("id", sessionId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Session slot deleted successfully",
      })
      fetchSessions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete session slot",
        variant: "destructive",
      })
    }
  }

  const toggleAvailability = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("session_slots")
        .update({ is_available: !currentStatus })
        .eq("id", sessionId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Session slot ${!currentStatus ? "enabled" : "disabled"}`,
      })
      fetchSessions()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update session slot",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      session_type: "video_call",
      session_date: "",
      duration_minutes: 30,
      price: 50,
      max_bookings: 1,
      description: "",
    })
    setEditingSession(null)
  }

  const getSessionTypeInfo = (type: string) => {
    return sessionTypes.find((t) => t.value === type) || sessionTypes[0]
  }

  const getStatusBadge = (session: SessionSlot) => {
    if (!session.is_available) {
      return <Badge variant="secondary">Disabled</Badge>
    }
    if (session.current_bookings >= session.max_bookings) {
      return <Badge className="bg-red-500/20 text-red-400">Fully Booked</Badge>
    }
    if (new Date(session.session_date) < new Date()) {
      return <Badge className="bg-gray-500/20 text-gray-400">Past</Badge>
    }
    return <Badge className="bg-green-500/20 text-green-400">Available</Badge>
  }

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-primary">Session Management</CardTitle>
            <CardDescription>Manage available meet & greet session slots</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-gradient-to-r from-primary to-primary/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Session Slot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" aria-describedby="session-dialog-description">
              <DialogHeader>
                <DialogTitle>{editingSession ? "Edit Session Slot" : "Create New Session Slot"}</DialogTitle>
                <DialogDescription id="session-dialog-description">
                  {editingSession ? "Update session slot details" : "Create a new available session slot for bookings"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session_type">Session Type</Label>
                    <Select
                      value={formData.session_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, session_type: value }))}
                    >
                      <SelectTrigger id="session_type">
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session_date">Session Date & Time</Label>
                    <Input
                      id="session_date"
                      type="datetime-local"
                      value={formData.session_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, session_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      min="15"
                      max="120"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, duration_minutes: Number.parseInt(e.target.value) || 30 }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_bookings">Max Bookings</Label>
                    <Input
                      id="max_bookings"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.max_bookings}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, max_bookings: Number.parseInt(e.target.value) || 1 }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any special notes or requirements for this session..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-primary/80">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingSession ? (
                      "Update Session"
                    ) : (
                      "Create Session"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => {
                const typeInfo = getSessionTypeInfo(session.session_type)
                const Icon = typeInfo.icon
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border border-muted rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{typeInfo.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.session_date).toLocaleString()} • {session.duration_minutes} min
                        </p>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">${session.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.current_bookings}/{session.max_bookings} booked
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(session)}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAvailability(session.id, session.is_available)}
                          >
                            {session.is_available ? "Disable" : "Enable"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(session)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(session.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No session slots created</p>
                <p>Create your first session slot to start accepting bookings</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

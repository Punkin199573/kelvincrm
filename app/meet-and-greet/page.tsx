import { Suspense } from "react"
import { MeetAndGreetBooking } from "@/components/meet-and-greet/meet-and-greet-booking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function MeetAndGreetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Meet & Greet with Kelvin
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Book your exclusive one-on-one video session with Kelvin Creekman
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Book Your Private Session
            </CardTitle>
            <CardDescription>
              Choose your preferred date and time for an exclusive video session with Kelvin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading booking system...</div>}>
              <MeetAndGreetBooking />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

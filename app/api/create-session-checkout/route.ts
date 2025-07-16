import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { sessionDate, callMethod, contactInfo, specialRequests, price } = await request.json()

    // Get user from session
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create session booking record
    const { data: sessionBooking, error: bookingError } = await supabaseAdmin
      .from("session_bookings")
      .insert({
        user_id: "user-id-placeholder", // This would come from auth
        session_date: sessionDate,
        call_method: callMethod,
        contact_info: contactInfo,
        special_requests: specialRequests,
        amount_paid: price,
        status: "pending",
      })
      .select()
      .single()

    if (bookingError) {
      console.error("Error creating session booking:", bookingError)
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Private Video Session - ${callMethod.charAt(0).toUpperCase() + callMethod.slice(1)}`,
              description: `15-minute private video call with Kelvin Creekman on ${new Date(sessionDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet`,
      metadata: {
        type: "session_booking",
        booking_id: sessionBooking.id,
        call_method: callMethod,
        session_date: sessionDate,
      },
    })

    // Update booking with Stripe session ID
    await supabaseAdmin.from("session_bookings").update({ stripe_session_id: session.id }).eq("id", sessionBooking.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating session checkout:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { sessionId, sessionDate, sessionTime, sessionType, contactInfo, specialRequests, price, duration } =
      await request.json()

    if (!sessionDate || !sessionTime || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user from auth header
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(token)
      userId = user?.id
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Private Video Session with Kelvin Creekman`,
              description: `${duration}-minute private video call scheduled for ${new Date(sessionDate).toLocaleDateString()} at ${sessionTime}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet`,
      metadata: {
        type: "session_booking",
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        sessionDate,
        sessionTime,
        sessionType: sessionType || "Private Video Call",
        contactInfo: JSON.stringify(contactInfo),
        specialRequests: specialRequests || "",
        duration: duration?.toString() || "30",
      },
      customer_email: contactInfo.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

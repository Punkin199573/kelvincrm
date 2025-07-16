import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { sessionDate, callMethod, contactInfo, specialRequests, price } = await request.json()

    // Get user from session
    const cookieStore = await cookies()
    const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get the session token from cookies
    const accessToken = cookieStore.get("sb-access-token")?.value
    const refreshToken = cookieStore.get("sb-refresh-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Set the session
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user details
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create or get Stripe customer
    let customerId = userData.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.full_name,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    // Create the session record first
    const { data: sessionRecord, error: sessionError } = await supabase
      .from("meet_greet_sessions")
      .insert({
        user_id: user.id,
        session_date: sessionDate,
        call_method: callMethod,
        contact_info: contactInfo,
        price: price,
        status: "scheduled",
        notes: specialRequests,
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Private Session with Kelvin Creekman`,
              description: `15-minute ${callMethod} video call on ${new Date(sessionDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet?canceled=true`,
      metadata: {
        sessionId: sessionRecord.id,
        userId: user.id,
        callMethod: callMethod,
      },
    })

    // Update session with Stripe payment intent ID
    await supabase
      .from("meet_greet_sessions")
      .update({ stripe_payment_intent_id: session.id })
      .eq("id", sessionRecord.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout session creation error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

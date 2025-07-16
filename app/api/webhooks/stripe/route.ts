import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.CheckoutSession

        if (session.metadata?.type === "private_session") {
          // Handle private session booking
          const { sessionDate, timeSlot, callMethod } = session.metadata

          // Get user ID from customer email
          const customerEmail = session.customer_details?.email
          if (customerEmail) {
            const { data: profile } = await supabase.from("profiles").select("id").eq("email", customerEmail).single()

            if (profile) {
              // Create private session record
              await supabase.from("private_sessions").insert({
                user_id: profile.id,
                session_date: sessionDate,
                duration_minutes: 15,
                call_method: callMethod as "whatsapp" | "signal" | "daily",
                status: "confirmed",
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                amount: (session.amount_total || 0) / 100,
              })
            }
          }
        } else {
          // Handle regular store orders
          const customerEmail = session.customer_details?.email
          if (customerEmail) {
            const { data: profile } = await supabase.from("profiles").select("id").eq("email", customerEmail).single()

            if (profile) {
              // Update order status
              await supabase
                .from("orders")
                .update({
                  status: "processing",
                  stripe_payment_intent_id: session.payment_intent as string,
                })
                .eq("stripe_session_id", session.id)
            }
          }
        }
        break

      case "payment_intent.succeeded":
        // Handle successful payment
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

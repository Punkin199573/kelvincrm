import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const customer = await stripe.customers.retrieve(session.customer as string)

    if (customer.deleted) return

    const email = customer.email
    const tier = session.metadata?.tier
    const isSignup = session.metadata?.signup === "true"

    if (!email || !tier) return

    if (isSignup) {
      // Handle signup completion - user account should be created after payment
      console.log("Signup payment completed for:", email, "tier:", tier)
    } else {
      // Handle regular purchase
      console.log("Purchase completed for:", email)
    }

    // Update customer with Stripe customer ID
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        stripe_customer_id: session.customer as string,
        tier: tier as "frost_fan" | "blizzard_vip" | "avalanche_backstage",
      })
      .eq("email", email)

    if (error) {
      console.error("Error updating profile:", error)
    }
  } catch (error) {
    console.error("Error handling checkout completed:", error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    if (customer.deleted) return

    const email = customer.email
    if (!email) return

    // Update subscription status in database if needed
    console.log("Subscription changed for:", email, "status:", subscription.status)
  } catch (error) {
    console.error("Error handling subscription change:", error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Handle successful one-time payments (store purchases)
    console.log("Payment succeeded:", paymentIntent.id)

    // Create order record if this is a store purchase
    if (paymentIntent.metadata?.order_id) {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "processing",
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq("id", paymentIntent.metadata.order_id)

      if (error) {
        console.error("Error updating order:", error)
      }
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error)
  }
}

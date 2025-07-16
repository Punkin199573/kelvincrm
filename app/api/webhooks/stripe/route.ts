import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase/server"

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
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { metadata } = session

    if (metadata?.sessionId) {
      // Handle meet and greet session payment
      const { error } = await supabase
        .from("meet_greet_sessions")
        .update({
          status: "scheduled",
          stripe_payment_intent_id: session.id,
        })
        .eq("id", metadata.sessionId)

      if (error) {
        console.error("Error updating session:", error)
      } else {
        console.log("Session payment completed:", metadata.sessionId)

        // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-meetgreet-confirmation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: metadata.sessionId }),
          })
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError)
        }
      }
    } else if (metadata?.eventId) {
      // Handle event registration payment
      const { error } = await supabase
        .from("event_registrations")
        .update({ stripe_payment_intent_id: session.payment_intent as string })
        .eq("event_id", metadata.eventId)
        .eq("user_id", metadata.userId)

      if (error) {
        console.error("Error updating event registration:", error)
      } else {
        console.log("Event registration payment completed")

        // Send confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-event-confirmation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: metadata.eventId,
              userId: metadata.userId,
            }),
          })
        } catch (emailError) {
          console.error("Error sending event confirmation email:", emailError)
        }
      }
    } else if (metadata?.orderId) {
      // Handle store order payment
      const { error } = await supabase
        .from("orders")
        .update({
          status: "processing",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", metadata.orderId)

      if (error) {
        console.error("Error updating order:", error)
      } else {
        console.log("Store order payment completed:", metadata.orderId)
      }
    }
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    const customerId = invoice.customer as string

    // Get user by Stripe customer ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single()

    if (userError || !user) {
      console.error("User not found for customer:", customerId)
      return
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    // Map price ID to tier
    let tier: "frost_fan" | "blizzard_vip" | "avalanche_backstage" = "frost_fan"

    if (priceId === process.env.STRIPE_BLIZZARD_VIP_PRICE_ID) {
      tier = "blizzard_vip"
    } else if (priceId === process.env.STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID) {
      tier = "avalanche_backstage"
    }

    // Update user subscription
    await supabase.from("user_subscriptions").upsert({
      user_id: user.id,
      stripe_subscription_id: subscriptionId,
      tier: tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })

    // Update user tier
    await supabase.from("users").update({ membership_tier: tier }).eq("id", user.id)

    console.log("Subscription updated for user:", user.id, "tier:", tier)
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)

    if (error) {
      console.error("Error updating subscription:", error)
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Get user by subscription ID
    const { data: userSub, error: subError } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscription.id)
      .single()

    if (subError || !userSub) {
      console.error("Subscription not found:", subscription.id)
      return
    }

    // Update subscription status
    await supabase
      .from("user_subscriptions")
      .update({ status: "cancelled" })
      .eq("stripe_subscription_id", subscription.id)

    // Downgrade user to basic tier
    await supabase.from("users").update({ membership_tier: "frost_fan" }).eq("id", userSub.user_id)

    console.log("Subscription cancelled for user:", userSub.user_id)
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}

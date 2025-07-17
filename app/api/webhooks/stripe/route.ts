import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabaseAdmin)
        break

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, supabaseAdmin)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseAdmin)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabaseAdmin)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabaseAdmin)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseAdmin)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabaseAdmin)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const { metadata } = session

  if (!metadata) {
    console.log("No metadata found in checkout session")
    return
  }

  console.log("Processing checkout completion:", metadata)

  switch (metadata.type) {
    case "subscription":
      await handleSubscriptionPayment(session, supabase)
      break

    case "store_purchase":
      await handleStoreOrder(session, supabase)
      break

    case "session_booking":
      await handleSessionBooking(session, supabase)
      break

    case "event_registration":
      await handleEventRegistration(session, supabase)
      break

    default:
      console.log(`Unknown checkout type: ${metadata.type}`)
  }
}

async function handleSubscriptionPayment(session: Stripe.Checkout.Session, supabase: any) {
  const userId = session.metadata?.userId
  const tier = session.metadata?.tier

  if (!userId || !tier) {
    console.error("Missing userId or tier in subscription metadata")
    return
  }

  // Update user tier
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      tier,
      subscription_status: "active",
      stripe_customer_id: session.customer,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    console.error("Error updating user tier:", updateError)
    return
  }

  // Send welcome email
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-welcome-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, tier, email: session.customer_details?.email }),
  })

  console.log(`User ${userId} upgraded to ${tier}`)
}

async function handleStoreOrder(session: Stripe.Checkout.Session, supabase: any) {
  const userId = session.metadata?.userId
  const cartItems = JSON.parse(session.metadata?.cartItems || "[]")

  if (!userId || !cartItems.length) {
    console.error("Missing userId or cartItems in store metadata")
    return
  }

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      stripe_session_id: session.id,
      total_amount: session.amount_total! / 100,
      status: "completed",
      items: cartItems,
    })
    .select()
    .single()

  if (orderError) {
    console.error("Error creating order:", orderError)
    return
  }

  // Send order confirmation email
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      orderId: order.id,
      email: session.customer_details?.email,
      items: cartItems,
      total: session.amount_total! / 100,
    }),
  })

  console.log(`Order ${order.id} completed for user ${userId}`)
}

async function handleSessionBooking(session: Stripe.Checkout.Session, supabase: any) {
  const userId = session.metadata?.userId
  const sessionDate = session.metadata?.sessionDate
  const sessionTime = session.metadata?.sessionTime
  const sessionType = session.metadata?.sessionType
  const contactInfo = JSON.parse(session.metadata?.contactInfo || "{}")
  const specialRequests = session.metadata?.specialRequests
  const duration = Number.parseInt(session.metadata?.duration || "30")

  if (!userId || !sessionDate || !sessionTime) {
    console.error("Missing session booking metadata")
    return
  }

  // Create session booking
  const { data: booking, error: bookingError } = await supabase
    .from("session_bookings")
    .insert({
      user_id: userId,
      session_type: sessionType || "Private Video Call",
      session_date: sessionDate,
      session_time: sessionTime,
      duration_minutes: duration,
      platform: "signal",
      status: "confirmed",
      stripe_session_id: session.id,
      amount_paid: session.amount_total! / 100,
      contact_info: contactInfo,
      special_requests: specialRequests,
    })
    .select()
    .single()

  if (bookingError) {
    console.error("Error creating session booking:", bookingError)
    return
  }

  // Send booking confirmation email
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-meetgreet-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: contactInfo.name || "Valued Customer",
      userEmail: contactInfo.email || session.customer_details?.email,
      sessionDate: new Date(sessionDate).toLocaleDateString(),
      sessionTime: sessionTime,
      sessionType: sessionType || "Private Video Call",
      sessionDuration: `${duration} minutes`,
      sessionPrice: `$${(session.amount_total! / 100).toFixed(2)}`,
      contactInfo: contactInfo.email || session.customer_details?.email,
      specialRequests: specialRequests,
    }),
  })

  console.log(`Session booking ${booking.id} confirmed for user ${userId}`)
}

async function handleEventRegistration(session: Stripe.Checkout.Session, supabase: any) {
  const userId = session.metadata?.userId
  const eventId = session.metadata?.eventId

  if (!userId || !eventId) {
    console.error("Missing userId or eventId in event metadata")
    return
  }

  // Create event registration
  const { data: registration, error: registrationError } = await supabase
    .from("event_registrations")
    .insert({
      user_id: userId,
      event_id: eventId,
      status: "confirmed",
      stripe_session_id: session.id,
      amount_paid: session.amount_total! / 100,
    })
    .select()
    .single()

  if (registrationError) {
    console.error("Error creating event registration:", registrationError)
    return
  }

  // Send event confirmation email
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-event-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      eventId,
      registrationId: registration.id,
      email: session.customer_details?.email,
    }),
  })

  console.log(`Event registration ${registration.id} confirmed for user ${userId}`)
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log(`Payment succeeded: ${paymentIntent.id}`)

  // Log payment success for tracking
  try {
    await supabase.from("payment_logs").insert({
      stripe_payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: "succeeded",
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error logging payment:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, supabase: any) {
  console.log(`Invoice payment succeeded: ${invoice.id}`)

  try {
    // Find user by customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", invoice.customer as string)
      .single()

    if (profile) {
      // Log payment success for tracking
      await supabase.from("payment_logs").insert({
        stripe_payment_intent_id: invoice.payment_intent as string,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: "succeeded",
        created_at: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  console.log(`Subscription created: ${subscription.id}`)

  try {
    // Find user by customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", subscription.customer as string)
      .single()

    if (profile) {
      // Update subscription record
      await supabase.from("user_subscriptions").upsert({
        user_id: profile.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error handling subscription created:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  console.log(`Subscription updated: ${subscription.id}`)

  try {
    // Update subscription record
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscription.id)

    if (error) {
      console.error("Error updating subscription:", error)
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  console.log(`Subscription deleted: ${subscription.id}`)

  try {
    // Find user by subscription ID
    const { data: userSub } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscription.id)
      .single()

    if (userSub) {
      // Update subscription status to cancelled
      await supabase
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id)

      // Downgrade user to free tier
      await supabase
        .from("profiles")
        .update({
          tier: "free",
          subscription_status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userSub.user_id)

      console.log(`User ${userSub.user_id} downgraded to free`)
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  console.log(`Payment failed for invoice: ${invoice.id}`)

  try {
    // Find user by customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("stripe_customer_id", invoice.customer as string)
      .single()

    if (!profile) {
      console.error("User not found for customer:", invoice.customer)
      return
    }

    // Update subscription status
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    if (error) {
      console.error("Error updating payment failure status:", error)
    }

    // TODO: Send payment failure notification email
    console.log(`Payment failed for user ${profile.id}`)
  } catch (error) {
    console.error("Error handling payment failed:", error)
  }
}

import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session

  if (!metadata) {
    console.log("No metadata found in checkout session")
    return
  }

  console.log("Processing checkout completion:", metadata)

  switch (metadata.type) {
    case "subscription":
      await handleSubscriptionCheckout(session)
      break

    case "store_purchase":
      await handleStoreCheckout(session)
      break

    case "session_booking":
      await handleSessionBookingCheckout(session)
      break

    case "event_registration":
      await handleEventRegistrationCheckout(session)
      break

    default:
      console.log(`Unknown checkout type: ${metadata.type}`)
  }
}

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const { customer, subscription, metadata } = session

  if (!customer || !subscription || !metadata?.user_id || !metadata?.tier) {
    console.error("Missing required data for subscription checkout")
    return
  }

  try {
    // Update user profile with new tier and Stripe customer ID
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        tier: metadata.tier as "frost_fan" | "blizzard_vip" | "avalanche_backstage",
        stripe_customer_id: customer as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.user_id)

    if (profileError) {
      console.error("Error updating user profile:", profileError)
      return
    }

    // Create subscription record
    const subscriptionData = await stripe.subscriptions.retrieve(subscription as string)

    const { error: subError } = await supabaseAdmin.from("user_subscriptions").upsert({
      user_id: metadata.user_id,
      stripe_subscription_id: subscription as string,
      stripe_customer_id: customer as string,
      tier: metadata.tier,
      status: subscriptionData.status,
      current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (subError) {
      console.error("Error creating subscription record:", subError)
    } else {
      console.log(`User ${metadata.user_id} upgraded to ${metadata.tier}`)

      // Send welcome email
      await sendWelcomeEmail(metadata.user_id, metadata.tier)
    }
  } catch (error) {
    console.error("Error handling subscription checkout:", error)
  }
}

async function handleStoreCheckout(session: Stripe.Checkout.Session) {
  const { metadata } = session

  if (!metadata?.order_id) {
    console.error("Missing order_id in store checkout")
    return
  }

  try {
    // Update order status to processing
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "processing",
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.order_id)

    if (error) {
      console.error("Error updating order:", error)
    } else {
      console.log(`Order ${metadata.order_id} marked as processing`)

      // Send order confirmation email
      await sendOrderConfirmationEmail(metadata.order_id)
    }
  } catch (error) {
    console.error("Error handling store checkout:", error)
  }
}

async function handleSessionBookingCheckout(session: Stripe.Checkout.Session) {
  const { metadata } = session

  if (!metadata?.booking_id) {
    console.error("Missing booking_id in session checkout")
    return
  }

  try {
    // Update session booking status to confirmed
    const { error } = await supabaseAdmin
      .from("session_bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        amount_paid: (session.amount_total || 0) / 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.booking_id)

    if (error) {
      console.error("Error updating session booking:", error)
    } else {
      console.log(`Session booking ${metadata.booking_id} confirmed`)

      // Send booking confirmation email
      await sendSessionConfirmationEmail(metadata.booking_id)
    }
  } catch (error) {
    console.error("Error handling session booking checkout:", error)
  }
}

async function handleEventRegistrationCheckout(session: Stripe.Checkout.Session) {
  const { metadata } = session

  if (!metadata?.registration_id) {
    console.error("Missing registration_id in event checkout")
    return
  }

  try {
    // Update event registration status
    const { error } = await supabaseAdmin
      .from("event_registrations")
      .update({
        registration_status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        amount_paid: (session.amount_total || 0) / 100,
        updated_at: new Date().toISOString(),
      })
      .eq("id", metadata.registration_id)

    if (error) {
      console.error("Error updating event registration:", error)
    } else {
      console.log(`Event registration ${metadata.registration_id} confirmed`)

      // Send event confirmation email
      await sendEventConfirmationEmail(metadata.registration_id)
    }
  } catch (error) {
    console.error("Error handling event registration checkout:", error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Payment succeeded: ${paymentIntent.id}`)

  // Log payment success for tracking
  try {
    await supabaseAdmin.from("payment_logs").insert({
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

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`)

  try {
    // Find user by customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", subscription.customer as string)
      .single()

    if (profile) {
      // Update subscription record
      await supabaseAdmin.from("user_subscriptions").upsert({
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`)

  try {
    // Update subscription record
    const { error } = await supabaseAdmin
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

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`)

  try {
    // Find user by subscription ID
    const { data: userSub } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscription.id)
      .single()

    if (userSub) {
      // Update subscription status to cancelled
      await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id)

      // Downgrade user to basic tier
      await supabaseAdmin
        .from("profiles")
        .update({
          tier: "frost_fan",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userSub.user_id)

      console.log(`User ${userSub.user_id} downgraded to frost_fan`)
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice: ${invoice.id}`)

  try {
    // Find user by customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", invoice.customer as string)
      .single()

    if (profile) {
      // Send payment failed notification
      await sendPaymentFailedEmail(profile.id, invoice.id)
    }
  } catch (error) {
    console.error("Error handling payment failed:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Invoice payment succeeded: ${invoice.id}`)

  try {
    // Find user by customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("stripe_customer_id", invoice.customer as string)
      .single()

    if (profile) {
      // Log payment success for tracking
      await supabaseAdmin.from("payment_logs").insert({
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

// Email notification functions
async function sendWelcomeEmail(userId: string, tier: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-welcome-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, tier }),
    })
  } catch (error) {
    console.error("Error sending welcome email:", error)
  }
}

async function sendOrderConfirmationEmail(orderId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
  }
}

async function sendSessionConfirmationEmail(bookingId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-session-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })
  } catch (error) {
    console.error("Error sending session confirmation email:", error)
  }
}

async function sendEventConfirmationEmail(registrationId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-event-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId }),
    })
  } catch (error) {
    console.error("Error sending event confirmation email:", error)
  }
}

async function sendPaymentFailedEmail(userId: string, invoiceId: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-payment-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, invoiceId }),
    })
  } catch (error) {
    console.error("Error sending payment failed email:", error)
  }
}

import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: NextRequest) {
  try {
    // List all webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list()

    const webhookStatus = webhooks.data.map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      status: webhook.status,
      enabled_events: webhook.enabled_events,
      created: new Date(webhook.created * 1000).toISOString(),
    }))

    // Check if required events are configured
    const requiredEvents = [
      "checkout.session.completed",
      "payment_intent.succeeded",
      "invoice.payment_succeeded",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_failed",
    ]

    const configuredEvents = webhooks.data.flatMap((w) => w.enabled_events)
    const missingEvents = requiredEvents.filter((event) => !configuredEvents.includes(event))

    return NextResponse.json({
      webhooks: webhookStatus,
      requiredEvents,
      missingEvents,
      isConfigured: missingEvents.length === 0,
      environmentVariables: {
        stripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    })
  } catch (error) {
    console.error("Error checking webhook status:", error)
    return NextResponse.json({ error: "Failed to check webhook status" }, { status: 500 })
  }
}

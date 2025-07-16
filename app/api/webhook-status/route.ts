import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET() {
  try {
    // Check Stripe connection
    const account = await stripe.accounts.retrieve()

    // Check required environment variables
    const requiredEnvVars = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    }

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    // Get webhook endpoints
    const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 10 })

    return NextResponse.json({
      status: "success",
      stripe: {
        connected: true,
        account_id: account.id,
        country: account.country,
        currency: account.default_currency,
      },
      environment_variables: {
        all_present: missingEnvVars.length === 0,
        missing: missingEnvVars,
        configured: Object.keys(requiredEnvVars).length - missingEnvVars.length,
      },
      webhooks: {
        count: webhookEndpoints.data.length,
        endpoints: webhookEndpoints.data.map((endpoint) => ({
          id: endpoint.id,
          url: endpoint.url,
          status: endpoint.status,
          events: endpoint.enabled_events.length,
        })),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Webhook status check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

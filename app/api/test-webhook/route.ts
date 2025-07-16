import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Test database connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Test environment variables
    const requiredEnvVars = [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing environment variables",
          missing: missingEnvVars,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Webhook system is ready",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Webhook test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventType, testData } = body

    // Simulate webhook processing
    console.log(`Testing webhook event: ${eventType}`)
    console.log("Test data:", testData)

    return NextResponse.json({
      status: "success",
      message: `Test webhook ${eventType} processed successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Test webhook failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

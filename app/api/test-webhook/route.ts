import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { eventType, data } = await request.json()

    // Create a test event
    const testEvent = await stripe.events.create({
      type: eventType,
      data: {
        object: data,
      },
    })

    // Send to webhook endpoint
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "test-signature",
      },
      body: JSON.stringify(testEvent),
    })

    const result = await webhookResponse.json()

    return NextResponse.json({
      success: true,
      eventId: testEvent.id,
      webhookResponse: result,
    })
  } catch (error) {
    console.error("Test webhook error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}

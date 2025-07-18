import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventTitle, price, eventDate, eventTime, location } = await request.json()

    if (!eventId || !eventTitle || !price) {
      return NextResponse.json({ error: "Missing required event information" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: eventTitle,
              description: `Event on ${eventDate} at ${eventTime} - ${location}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/events/success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/events`,
      metadata: {
        type: "event_booking",
        eventId,
        eventTitle,
        eventDate,
        eventTime,
        location,
        price: price.toString(),
      },
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: any) {
    console.error("Error creating event checkout session:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

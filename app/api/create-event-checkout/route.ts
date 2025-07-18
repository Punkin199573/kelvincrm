import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventTitle, price, eventDate, eventTime, location } = await request.json()

    if (!eventId || !eventTitle || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
              images: ["https://your-domain.com/event-image.jpg"], // You can add event images here
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/events/success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `${request.nextUrl.origin}/events`,
      metadata: {
        eventId,
        eventTitle,
        eventDate,
        eventTime,
        location,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating event checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

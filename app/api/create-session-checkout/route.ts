import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { sessionId, sessionDate, sessionTime, sessionType, contactInfo, specialRequests, price, duration, userId } =
      await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${sessionType} with Kelvin Creekman`,
              description: `${duration} minute private video session`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet?payment=cancelled`,
      metadata: {
        type: "session_booking",
        sessionId,
        sessionDate,
        sessionTime,
        sessionType,
        contactInfo: JSON.stringify(contactInfo),
        specialRequests: specialRequests || "",
        duration: duration.toString(),
        userId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating session checkout:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { sessionType, sessionId, amount, duration, scheduledDate, scheduledTime, userInfo, userId } =
      await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Private ${sessionType.toUpperCase()} Session with Kelvin Creekman`,
              description: `${duration} minute exclusive 1-on-1 video session on ${scheduledDate} at ${scheduledTime}`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet?payment=cancelled`,
      metadata: {
        sessionType,
        sessionId,
        userId,
        scheduledDate,
        scheduledTime,
        duration: duration.toString(),
        userInfo: JSON.stringify(userInfo),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Error creating session checkout:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

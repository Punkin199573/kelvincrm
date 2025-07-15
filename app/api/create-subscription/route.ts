import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const tierPriceIds = {
  frost_fan: process.env.STRIPE_FROST_FAN_PRICE_ID!,
  blizzard_vip: process.env.STRIPE_BLIZZARD_VIP_PRICE_ID!,
  avalanche_backstage: process.env.STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID!,
}

export async function POST(request: NextRequest) {
  try {
    const { email, tier, signup } = await request.json()

    if (!email || !tier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create or retrieve customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          tier: tier,
          signup: signup ? "true" : "false",
        },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: tierPriceIds[tier as keyof typeof tierPriceIds],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/signup`,
      metadata: {
        tier: tier,
        signup: signup ? "true" : "false",
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("Error creating subscription:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

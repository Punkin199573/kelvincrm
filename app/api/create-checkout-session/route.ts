import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// Validate currency and provide fallback
const validateCurrency = (currency?: string): string => {
  const validCurrencies = ["usd", "eur", "gbp", "cad", "aud"]

  if (!currency || typeof currency !== "string") {
    return "usd"
  }

  const normalizedCurrency = currency.toLowerCase().trim()
  return validCurrencies.includes(normalizedCurrency) ? normalizedCurrency : "usd"
}

// Membership tier configurations
const membershipTiers = {
  frost_fan: {
    name: "Frost Fan",
    price: 9.99,
    priceId: process.env.STRIPE_FROST_FAN_PRICE_ID,
  },
  blizzard_vip: {
    name: "Blizzard VIP",
    price: 19.99,
    priceId: process.env.STRIPE_BLIZZARD_VIP_PRICE_ID,
  },
  avalanche_backstage: {
    name: "Avalanche Backstage",
    price: 49.99,
    priceId: process.env.STRIPE_AVALANCHE_BACKSTAGE_PRICE_ID,
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier, email, isSignup, currency: requestCurrency, userId, successUrl, cancelUrl } = body

    // Validate required fields
    if (!tier || !email) {
      return NextResponse.json({ error: "Missing required fields: tier and email" }, { status: 400 })
    }

    // Validate email format
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate tier
    const selectedTier = membershipTiers[tier as keyof typeof membershipTiers]
    if (!selectedTier) {
      return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 })
    }

    // Validate currency
    const validatedCurrency = validateCurrency(requestCurrency)

    // Prepare metadata
    const metadata: Record<string, string> = {
      type: "subscription",
      tier,
      email,
      isSignup: isSignup ? "true" : "false",
      currency: validatedCurrency,
    }

    if (userId) {
      metadata.userId = userId
    }

    // Create checkout session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      metadata: metadata,
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url:
        cancelUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?tier=${tier}&email=${encodeURIComponent(email)}&signup=${isSignup}&cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    }

    // Use price ID if available, otherwise create price data
    if (selectedTier.priceId) {
      sessionParams.line_items = [
        {
          price: selectedTier.priceId,
          quantity: 1,
        },
      ]
    } else {
      sessionParams.line_items = [
        {
          price_data: {
            currency: validatedCurrency,
            product_data: {
              name: `${selectedTier.name} Membership`,
              description: `Monthly subscription to Kelvin Creekman ${selectedTier.name} tier`,
            },
            unit_amount: Math.round(selectedTier.price * 100),
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ]
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

    if (!session.url) {
      throw new Error("Failed to create checkout session URL")
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      currency: validatedCurrency,
      amount: selectedTier.price,
    })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)

    let errorMessage = "Failed to create checkout session"
    if (error.message?.includes("Invalid")) {
      errorMessage = error.message
    } else if (error.message?.includes("No such")) {
      errorMessage = "Invalid subscription configuration"
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

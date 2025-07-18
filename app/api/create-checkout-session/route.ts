import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// Validate currency and provide fallback
const validateCurrency = (currency?: string): string => {
  const validCurrencies = ["usd", "eur", "gbp", "cad", "aud", "jpy"]

  if (!currency || typeof currency !== "string") {
    return "usd"
  }

  const normalizedCurrency = currency.toLowerCase().trim()
  return validCurrencies.includes(normalizedCurrency) ? normalizedCurrency : "usd"
}

// Validate price amount
const validateAmount = (amount?: number): number => {
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
    return 999 // Default fallback amount in cents
  }
  return Math.round(amount * 100) // Convert to cents
}

// Membership tier pricing
const membershipTiers = {
  frost_fan: { name: "Frost Fan", price: 9.99, priceId: process.env.STRIPE_FROST_FAN_PRICE_ID },
  blizzard_vip: { name: "Blizzard VIP", price: 19.99, priceId: process.env.STRIPE_BLIZZARD_VIP_PRICE_ID },
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
      return NextResponse.json({ error: "Missing required fields: tier and email are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate tier
    const tierData = membershipTiers[tier as keyof typeof membershipTiers]
    if (!tierData) {
      return NextResponse.json({ error: "Invalid membership tier" }, { status: 400 })
    }

    // Validate currency
    const validatedCurrency = validateCurrency(requestCurrency)

    // Validate amount
    const amount = validateAmount(tierData.price)

    // Prepare session metadata
    const metadata: Record<string, string> = {
      type: isSignup ? "subscription_signup" : "subscription",
      tier: tier,
      email: email,
      isSignup: isSignup ? "true" : "false",
    }

    if (userId) {
      metadata.userId = userId
    }

    // Create line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: validatedCurrency,
          product_data: {
            name: `${tierData.name} Membership`,
            description: `Monthly subscription to Kelvin Creekman Fan Club - ${tierData.name} tier`,
            images: [`${process.env.NEXT_PUBLIC_BASE_URL}/kelvin-logo.png`],
          },
          unit_amount: amount,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ]

    // Prepare session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      success_url:
        successUrl ||
        `${process.env.NEXT_PUBLIC_BASE_URL}/signup/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/signup?cancelled=true`,
      customer_email: email,
      metadata: metadata,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      subscription_data: {
        metadata: metadata,
      },
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
      amount: amount / 100, // Return amount in dollars
    })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)

    // Return appropriate error message
    let errorMessage = "Failed to create checkout session"
    if (error.message?.includes("No such price")) {
      errorMessage = "Invalid pricing configuration"
    } else if (error.message?.includes("Invalid currency")) {
      errorMessage = "Invalid currency specified"
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

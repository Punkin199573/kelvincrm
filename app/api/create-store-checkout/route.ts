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

// Validate and sanitize item data
const validateCartItem = (item: any) => {
  if (!item || typeof item !== "object") {
    throw new Error("Invalid item data")
  }

  const name = item.name && typeof item.name === "string" ? item.name.trim() : "Unknown Item"
  const price = typeof item.price === "number" && item.price > 0 ? item.price : 0
  const quantity = typeof item.quantity === "number" && item.quantity > 0 ? Math.floor(item.quantity) : 1
  const image = item.image && typeof item.image === "string" ? item.image : null

  if (price <= 0) {
    throw new Error(`Invalid price for item: ${name}`)
  }

  return {
    id: item.id || `item_${Date.now()}_${Math.random()}`,
    name,
    price,
    quantity,
    image,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, userId, userEmail, currency: requestCurrency, successUrl, cancelUrl } = body

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    // Validate and sanitize items
    let validatedItems
    try {
      validatedItems = items.map(validateCartItem)
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Validate currency
    const validatedCurrency = validateCurrency(requestCurrency)

    // Calculate total amount with validation
    const totalAmount = validatedItems.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      if (isNaN(itemTotal) || itemTotal < 0) {
        throw new Error(`Invalid calculation for item: ${item.name}`)
      }
      return sum + itemTotal
    }, 0)

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 })
    }

    // Create line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedItems.map((item) => ({
      price_data: {
        currency: validatedCurrency,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          description: `Kelvin Creekman merchandise - ${item.name}`,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Prepare metadata
    const metadata: Record<string, string> = {
      type: "store_purchase",
      userId: userId || "guest",
      cartItems: JSON.stringify(validatedItems),
      totalAmount: totalAmount.toString(),
      currency: validatedCurrency,
    }

    // Prepare session parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/store?cancelled=true`,
      metadata: metadata,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "BE"],
      },
    }

    // Add customer email if provided and valid
    if (userEmail && typeof userEmail === "string" && userEmail.includes("@")) {
      sessionParams.customer_email = userEmail
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

    if (!session.url) {
      throw new Error("Failed to create checkout session URL")
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      currency: validatedCurrency,
      totalAmount: totalAmount,
    })
  } catch (error: any) {
    console.error("Error creating store checkout session:", error)

    let errorMessage = "Failed to create checkout session"
    if (error.message?.includes("Invalid")) {
      errorMessage = error.message
    } else if (error.message?.includes("No such")) {
      errorMessage = "Invalid product configuration"
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

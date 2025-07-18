import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { sessionId, type, tier, userData } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 })
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Process based on type
    if (type === "subscription" && userData) {
      await processSubscriptionPayment(session, tier, userData)
    } else if (type === "store") {
      await processStorePayment(session)
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and processed successfully",
    })
  } catch (error: any) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        error: error.message || "Payment verification failed",
      },
      { status: 500 },
    )
  }
}

async function processSubscriptionPayment(session: Stripe.Checkout.Session, tier: string, userData: any) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(userData.email)

    let userId = existingUser?.user?.id

    // If user doesn't exist, create them
    if (!existingUser?.user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
          membership_tier: tier,
        },
      })

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`)
      }

      userId = newUser.user?.id
    }

    if (!userId) {
      throw new Error("Failed to get user ID")
    }

    // Create or update profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: userData.email,
      full_name: userData.fullName,
      tier: tier,
      subscription_status: "active",
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      throw new Error("Failed to create user profile")
    }

    // Send welcome email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-welcome-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tier,
          email: userData.email,
          fullName: userData.fullName,
        }),
      })
    } catch (emailError) {
      console.error("Welcome email error:", emailError)
      // Don't throw error for email failure
    }

    console.log(`Subscription processed for user ${userId} with tier ${tier}`)
  } catch (error) {
    console.error("Subscription processing error:", error)
    throw error
  }
}

async function processStorePayment(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata
    if (!metadata) {
      throw new Error("No metadata found in session")
    }

    const userId = metadata.userId
    const cartItems = JSON.parse(metadata.cartItems || "[]")
    const totalAmount = Number.parseFloat(metadata.totalAmount || "0")

    // Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId === "guest" ? null : userId,
        stripe_session_id: session.id,
        total_amount: totalAmount,
        status: "completed",
        items: cartItems,
        customer_email: session.customer_details?.email,
        shipping_address: session.shipping_details?.address,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    // Send order confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId === "guest" ? null : userId,
          orderId: order.id,
          email: session.customer_details?.email,
          items: cartItems,
          total: totalAmount,
        }),
      })
    } catch (emailError) {
      console.error("Order confirmation email error:", emailError)
      // Don't throw error for email failure
    }

    console.log(`Store order ${order.id} processed successfully`)
  } catch (error) {
    console.error("Store payment processing error:", error)
    throw error
  }
}

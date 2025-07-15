import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { supabase } from "@/lib/supabase/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session

        // Check if this is a session booking
        if (session.metadata?.sessionType) {
          await handleSessionBooking(session)
        } else {
          // Handle regular store orders
          await handleStoreOrder(session)
        }
        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("Payment succeeded:", paymentIntent.id)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSessionBooking(session: Stripe.Checkout.Session) {
  const { sessionType, userId, scheduledDate, scheduledTime, duration, userInfo } = session.metadata!

  const userInfoParsed = JSON.parse(userInfo!)

  // Create session booking record
  const { error } = await supabase.from("session_bookings").insert({
    user_id: userId,
    session_type: sessionType,
    session_duration: Number.parseInt(duration!),
    amount_paid: (session.amount_total || 0) / 100,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
    contact_info: {
      whatsapp: userInfoParsed.whatsappNumber,
      signal: userInfoParsed.signalUsername,
      phone: userInfoParsed.phone,
    },
    special_requests: userInfoParsed.specialRequests,
    status: "confirmed",
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent as string,
  })

  if (error) {
    console.error("Error creating session booking:", error)
    throw error
  }

  console.log("Session booking created successfully")
}

async function handleStoreOrder(session: Stripe.Checkout.Session) {
  const { userId, items } = session.metadata!
  const itemsParsed = JSON.parse(items!)

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      total_amount: (session.amount_total || 0) / 100,
      status: "processing",
      items: itemsParsed,
      shipping_address: session.shipping_details,
    })
    .select()
    .single()

  if (orderError) {
    console.error("Error creating order:", orderError)
    throw orderError
  }

  // Create order items
  for (const item of itemsParsed) {
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
    })

    if (itemError) {
      console.error("Error creating order item:", itemError)
      throw itemError
    }
  }

  console.log("Store order created successfully")
}

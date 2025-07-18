import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    // Get order details with user info
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        ),
        order_items (
          quantity,
          price,
          products (
            name,
            image_url
          )
        )
      `)
      .eq("id", orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const itemsHtml = order.order_items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <img src="${item.products.image_url}" alt="${item.products.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.products.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        </tr>
      `,
      )
      .join("")

    await resend.emails.send({
      from: "Kelvin Creekman Store <store@livewithcreekman.vip>",
      to: [order.profiles.email],
      subject: `Order Confirmation #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Order Confirmed! 🛍️</h1>
          <p>Hi ${order.profiles.full_name || order.profiles.email},</p>
          <p>Thank you for your order! We're processing it now and will ship it soon.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Order #${order.id.slice(0, 8)}</h2>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            
            <table style="width: 100%; margin-top: 20px;">
              <thead>
                <tr style="background: #e5e7eb;">
                  <th style="padding: 10px; text-align: left;">Image</th>
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          
          <p>We'll send you another email with tracking information once your order ships.</p>
          
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/store" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Continue Shopping
            </a>
          </p>
          
          <p>Thanks for supporting Kelvin!</p>
          <p>The Kelvin Creekman Store Team</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending order confirmation:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

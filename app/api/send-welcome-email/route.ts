import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const resend = new Resend(process.env.RESEND_API_KEY)

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { userId, tier } = await request.json()

    // Get user details
    const { data: profile, error } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const tierNames = {
      frost_fan: "Frost Fan",
      blizzard_vip: "Blizzard VIP",
      avalanche_backstage: "Avalanche Backstage",
    }

    const tierName = tierNames[tier as keyof typeof tierNames] || "Frost Fan"

    await resend.emails.send({
      from: "Kelvin Creekman Fan Club <noreply@kelvincrm.com>",
      to: [profile.email],
      subject: `Welcome to ${tierName}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to ${tierName}!</h1>
          <p>Hi ${profile.full_name || profile.email},</p>
          <p>Thank you for joining the Kelvin Creekman Fan Club as a ${tierName} member!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Your ${tierName} Benefits Include:</h2>
            ${
              tier === "frost_fan"
                ? `
              <ul>
                <li>Access to exclusive content</li>
                <li>Community forum access</li>
                <li>Monthly newsletter</li>
              </ul>
            `
                : tier === "blizzard_vip"
                  ? `
              <ul>
                <li>All Frost Fan benefits</li>
                <li>Priority event booking</li>
                <li>Exclusive merchandise discounts</li>
                <li>VIP content access</li>
              </ul>
            `
                  : `
              <ul>
                <li>All previous tier benefits</li>
                <li>Backstage access to events</li>
                <li>Personal meet & greet sessions</li>
                <li>Exclusive backstage content</li>
                <li>Direct messaging with Kelvin</li>
              </ul>
            `
            }
          </div>
          
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Access Your Dashboard
            </a>
          </p>
          
          <p>Welcome to the family!</p>
          <p>The Kelvin Creekman Team</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

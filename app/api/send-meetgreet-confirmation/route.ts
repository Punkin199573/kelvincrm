import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Replace with your email address to receive notifications
const NOTIFICATION_EMAIL = "your-email@example.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, sessionDate, sessionTime, amount } = body

    if (!email || !name || !sessionDate || !sessionTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format the date and time for display
    const formattedDate = new Date(sessionDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Send confirmation email to the user
    const userEmailResult = await resend.emails.send({
      from: "Kelvin Creekman <noreply@kelvincrm.com>",
      to: [email],
      subject: "Your Meet & Greet Session is Confirmed! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Session Confirmed!</h1>
            <p style="color: #6b7280; font-size: 16px;">Your private meet & greet with Kelvin Creekman</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Session Details</h2>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
            <p><strong>Duration:</strong> 30 minutes</p>
            <p><strong>Platform:</strong> Signal Video Call</p>
            <p><strong>Amount Paid:</strong> $${amount}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-top: 0;">Before Your Call:</h3>
            <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
              <li>Download and install Signal app if you haven't already</li>
              <li>Test your camera and microphone</li>
              <li>Find a quiet, well-lit space</li>
              <li>Join the call 2-3 minutes early</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/meet-and-greet/success" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Session Details
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Questions? Reply to this email or contact us at support@kelvincrm.com</p>
            <p>Thank you for being an amazing fan! 🎵</p>
          </div>
        </div>
      `,
    })

    // Send notification email to admin
    const adminEmailResult = await resend.emails.send({
      from: "Kelvin CRM <noreply@kelvincrm.com>",
      to: [NOTIFICATION_EMAIL],
      subject: `New Meet & Greet Booking - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626;">New Meet & Greet Booking</h1>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h2 style="margin-top: 0; color: #991b1b;">Booking Details</h2>
            <p><strong>Customer:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Booked:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px;">
            <p style="margin: 0; color: #0369a1;">
              <strong>Action Required:</strong> Please add this session to your calendar and prepare the Signal call link.
            </p>
          </div>
        </div>
      `,
    })

    console.log("User email result:", userEmailResult)
    console.log("Admin email result:", adminEmailResult)

    return NextResponse.json({
      success: true,
      userEmailId: userEmailResult.data?.id,
      adminEmailId: adminEmailResult.data?.id,
    })
  } catch (error) {
    console.error("Error sending meet & greet confirmation:", error)
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
  }
}

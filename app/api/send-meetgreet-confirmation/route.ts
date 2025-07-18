import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// IMPORTANT: Replace this email with your actual notification email
const NOTIFICATION_EMAIL = "steadymj@gmail.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userName,
      userEmail,
      sessionDate,
      sessionTime,
      sessionType,
      sessionDuration,
      sessionPrice,
      contactInfo,
      specialRequests,
      preferredTime,
    } = body

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Kelvin Creekman Fan Club <noreply@livewithcreekman.vip>",
      to: [userEmail],
      subject: `Meet & Greet Confirmation: ${sessionType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meet & Greet Confirmation</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            }
            .container {
              background: white;
              border-radius: 15px;
              padding: 30px;
              box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #1e3c72;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              background: linear-gradient(135deg, #1e3c72, #2a5298);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 10px;
            }
            .title {
              color: #1e3c72;
              font-size: 24px;
              margin: 0;
            }
            .session-details {
              background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
              border-radius: 10px;
              padding: 25px;
              margin: 25px 0;
              border-left: 5px solid #1e3c72;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #d6ebff;
            }
            .detail-row:last-child {
              border-bottom: none;
              margin-bottom: 0;
            }
            .detail-label {
              font-weight: bold;
              color: #1e3c72;
              min-width: 140px;
            }
            .detail-value {
              color: #333;
              text-align: right;
              flex: 1;
            }
            .important-info {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #f0f0f0;
              color: #666;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3c72, #2a5298);
              color: white;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 25px;
              font-weight: bold;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">❄️ KELVIN CREEKMAN ⚡</div>
              <h1 class="title">Meet & Greet Confirmed!</h1>
            </div>
            
            <p>Hey ${userName}! 🎸</p>
            
            <p>Your private session with Kelvin has been confirmed! This is going to be an incredible one-on-one experience that you'll never forget.</p>
            
            <div class="session-details">
              <h3 style="color: #1e3c72; margin-top: 0;">🎥 Session Details</h3>
              <div class="detail-row">
                <span class="detail-label">Session Type:</span>
                <span class="detail-value">${sessionType}</span>
              </div>
              ${
                sessionDate
                  ? `
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${sessionDate}</span>
              </div>
              `
                  : ""
              }
              ${
                sessionTime
                  ? `
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${sessionTime}</span>
              </div>
              `
                  : ""
              }
              ${
                sessionDuration
                  ? `
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${sessionDuration}</span>
              </div>
              `
                  : ""
              }
              ${
                sessionPrice
                  ? `
              <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">${sessionPrice}</span>
              </div>
              `
                  : ""
              }
            </div>
            
            ${
              specialRequests
                ? `
            <div class="important-info">
              <h4 style="margin-top: 0; color: #856404;">📝 Your Special Requests:</h4>
              <p style="margin-bottom: 0;">${specialRequests}</p>
            </div>
            `
                : ""
            }
            
            <div class="important-info">
              <h4 style="margin-top: 0; color: #856404;">⚡ Important Reminders:</h4>
              <ul style="margin-bottom: 0;">
                <li>This is a private, exclusive session via Signal</li>
                <li>Download Signal app before your session</li>
                <li>Find a quiet, well-lit space for the call</li>
                <li>Have your questions ready - this is your chance to connect with Kelvin!</li>
                <li>Check your email for any last-minute updates</li>
              </ul>
            </div>
            
            <p>Can't wait to meet you! 🤘<br>
            <strong>Kelvin & The Team</strong></p>
            
            <div class="footer">
              <p style="font-size: 12px; color: #999;">
                © 2024 Kelvin Creekman Fan Club. All rights reserved.<br>
                You're receiving this because you booked a meet & greet session.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Kelvin Creekman Fan Club <noreply@kelvincreekman.com>",
      to: [NOTIFICATION_EMAIL],
      subject: `New Meet & Greet Booking: ${userName}`,
      html: `
        <h2>New Meet & Greet Booking</h2>
        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Session Type:</strong> ${sessionType}</p>
        <p><strong>Date:</strong> ${sessionDate || "TBD"}</p>
        <p><strong>Time:</strong> ${sessionTime || "TBD"}</p>
        <p><strong>Duration:</strong> ${sessionDuration || "30 minutes"}</p>
        <p><strong>Price:</strong> ${sessionPrice || "$99.99"}</p>
        ${contactInfo ? `<p><strong>Contact Info:</strong> ${JSON.stringify(contactInfo)}</p>` : ""}
        ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ""}
      `,
    })

    if (userEmailResponse.error || adminEmailResponse.error) {
      console.error("Error sending emails:", { userEmailResponse, adminEmailResponse })
      return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { userEmailResponse, adminEmailResponse } })
  } catch (error) {
    console.error("Error in send-meetgreet-confirmation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

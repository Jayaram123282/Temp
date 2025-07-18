import { type NextRequest, NextResponse } from "next/server"

const ADMIN_PHONE = "+91 9876543210" // Replace with your actual phone number

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    let smsMessage = ""
    let shouldSendSMS = false

    switch (notification.type) {
      case "cart_add":
        smsMessage = `🛒 New item added to cart!\nProduct: ${notification.productName}\nUser: ${notification.userEmail || "Guest"}\nTime: ${new Date().toLocaleString()}`
        shouldSendSMS = true
        break

      case "order_placed":
        smsMessage = `🎉 NEW ORDER RECEIVED!\nOrder Value: ₹${notification.orderValue}/-\nCustomer: ${notification.userEmail}\nTime: ${new Date().toLocaleString()}\n\nCheck your dashboard for details!`
        shouldSendSMS = true
        break

      case "user_signup":
        smsMessage = `👤 New user registered!\nEmail: ${notification.userEmail}\nTime: ${new Date().toLocaleString()}`
        shouldSendSMS = false // Optional: set to true if you want SMS for signups
        break

      case "wishlist_add":
        smsMessage = `❤️ Item added to wishlist!\nProduct: ${notification.productName}\nUser: ${notification.userEmail || "Guest"}\nTime: ${new Date().toLocaleString()}`
        shouldSendSMS = false // Optional: set to true if you want SMS for wishlist
        break
    }

    // Send SMS notification to admin if required
    if (shouldSendSMS && smsMessage) {
      try {
        await fetch(`${request.nextUrl.origin}/api/sms/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: ADMIN_PHONE,
            message: smsMessage,
            type: notification.type,
          }),
        })
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError)
      }
    }

    // Log notification (in production, save to database)
    console.log("📢 Admin Notification:", {
      type: notification.type,
      message: notification.message,
      timestamp: new Date().toISOString(),
      smsMessage: shouldSendSMS ? smsMessage : "No SMS sent",
    })

    return NextResponse.json({
      success: true,
      message: "Notification processed",
      smsSent: shouldSendSMS,
    })
  } catch (error) {
    console.error("Admin notification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process notification",
      },
      { status: 500 },
    )
  }
}

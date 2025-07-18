import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const RAZORPAY_KEY_SECRET = "L0UQM0yHSmzEw6JttWJf29N7"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Payment is verified
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      })
    } else {
      // Payment verification failed
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
      },
      { status: 500 },
    )
  }
}

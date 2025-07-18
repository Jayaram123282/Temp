import { type NextRequest, NextResponse } from "next/server"

const RAZORPAY_KEY_ID = "rzp_test_65gCGlVusdtnNP"
const RAZORPAY_KEY_SECRET = "L0UQM0yHSmzEw6JttWJf29N7"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json()

    // Create order with Razorpay
    const orderData = {
      amount: amount, // amount in paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")

    // Make API call to Razorpay
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order")
    }

    const order = await response.json()
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

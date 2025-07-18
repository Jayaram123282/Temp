import { type NextRequest, NextResponse } from "next/server"

// In a real app, you'd use a proper database
// For demo purposes, we'll use a simple in-memory store
const users = new Map([
  [
    "demo@ram.com",
    {
      id: "1",
      email: "demo@ram.com",
      password: "password123",
      firstName: "Demo",
      lastName: "User",
      phone: "+91 9876543210",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ],
])

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json()

    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password, // In real app, hash this password
      firstName,
      lastName,
      phone: phone || "",
      createdAt: new Date().toISOString(),
    }

    users.set(email.toLowerCase(), newUser)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

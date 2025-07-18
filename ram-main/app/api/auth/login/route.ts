import { type NextRequest, NextResponse } from "next/server"

// In a real app, you'd use a proper database
// For demo purposes, we'll use a simple in-memory store
const users = new Map([
  [
    "demo@ram.com",
    {
      id: "1",
      email: "demo@ram.com",
      password: "password123", // In real app, this would be hashed
      firstName: "Demo",
      lastName: "User",
      phone: "+91 9876543210",
      createdAt: "2024-01-01T00:00:00.000Z",
    },
  ],
])

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = users.get(email.toLowerCase())

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

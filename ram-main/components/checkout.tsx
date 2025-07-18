"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { initializeRazorpay, createRazorpayOrder, type RazorpayOptions } from "@/lib/razorpay"
import { useNotifications } from "@/contexts/notification-context"
import { showToast } from "./toast-container"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  selectedSize: string
}

interface CheckoutProps {
  cart: CartItem[]
  onBack: () => void
  onOrderComplete: (orderData: any) => void
}

interface FormData {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
  sameAsShipping: boolean
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
}

export default function Checkout({ cart, onBack, onOrderComplete }: CheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    paymentMethod: "razorpay",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    sameAsShipping: true,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 1500 ? 0 : 99
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  const { addNotification } = useNotifications()

  useEffect(() => {
    const loadRazorpay = async () => {
      const loaded = await initializeRazorpay()
      setRazorpayLoaded(loaded)
    }
    loadRazorpay()
  }, [])

  const validateStep = (step: number) => {
    const newErrors: Partial<FormData> = {}

    if (step === 1) {
      if (!formData.email) newErrors.email = "Email is required"
      if (!formData.firstName) newErrors.firstName = "First name is required"
      if (!formData.lastName) newErrors.lastName = "Last name is required"
      if (!formData.address) newErrors.address = "Address is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.state) newErrors.state = "State is required"
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required"
      if (!formData.phone) newErrors.phone = "Phone number is required"
    }

    if (step === 2) {
      if (formData.paymentMethod === "card") {
        if (!formData.cardNumber) newErrors.cardNumber = "Card number is required"
        if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required"
        if (!formData.cvv) newErrors.cvv = "CVV is required"
        if (!formData.nameOnCard) newErrors.nameOnCard = "Name on card is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (paymentError) {
      setPaymentError(null)
    }
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const verifyPayment = async (paymentData: any) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Payment verification error:", error)
      return false
    }
  }

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) {
      setPaymentError("Payment system not loaded. Please refresh and try again.")
      return
    }

    try {
      setIsProcessing(true)
      setPaymentError(null)

      // Create order
      const order = await createRazorpayOrder(total)

      const options: RazorpayOptions = {
        key: "rzp_live_KNPXp3ky6G8itA"
        amount: order.amount,
        currency: order.currency,
        name: "RAM",
        description: "Purchase from RAM Fashion",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const isVerified = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })

            if (isVerified) {
              // Payment successful and verified
              const orderData = {
                orderId: `RAM-${Date.now()}`,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                items: cart,
                customer: {
                  email: formData.email,
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  phone: formData.phone,
                },
                shipping: {
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                },
                payment: {
                  method: "razorpay",
                  amount: total,
                  status: "completed",
                  verified: true,
                },
                summary: {
                  subtotal,
                  shipping,
                  tax,
                  total,
                },
                orderDate: new Date().toISOString(),
              }

              addNotification({
                type: "order_placed",
                message: `New order placed - ₹${total}/-`,
                userEmail: formData.email,
                orderValue: total,
              })

              showToast({
                type: "success",
                message: "Order placed successfully!",
              })

              setIsProcessing(false)
              setCurrentStep(3)
              onOrderComplete(orderData)
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification failed:", error)
            setPaymentError("Payment verification failed. Please contact support.")
            setIsProcessing(false)
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            setPaymentError("Payment was cancelled. Please try again.")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Payment failed:", error)
      setIsProcessing(false)
      setPaymentError("Payment failed. Please try again.")
    }
  }

  const handleSubmitOrder = async () => {
    if (!validateStep(2)) return

    if (formData.paymentMethod === "razorpay") {
      await handleRazorpayPayment()
      return
    }

    setIsProcessing(true)

    // Simulate other payment methods
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const orderData = {
      orderId: `RAM-${Date.now()}`,
      items: cart,
      customer: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      },
      shipping: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      payment: {
        method: formData.paymentMethod,
        amount: total,
      },
      summary: {
        subtotal,
        shipping,
        tax,
        total,
      },
      orderDate: new Date().toISOString(),
    }

    addNotification({
      type: "order_placed",
      message: `New order placed - ₹${total}/-`,
      userEmail: formData.email,
      orderValue: total,
    })

    showToast({
      type: "success",
      message: "Order placed successfully!",
    })

    setIsProcessing(false)
    setCurrentStep(3)
    onOrderComplete(orderData)
  }

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your purchase. Your order has been successfully placed and payment verified.
            </p>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono">RAM-{Date.now()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold">₹{total}/-</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{formData.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-green-600 font-medium">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>5-7 business days</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 space-y-4">
              <Button onClick={onBack} className="w-full">
                Continue Shopping
              </Button>
              <p className="text-sm text-gray-500">You will receive an order confirmation email shortly.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <div className={`h-1 w-16 ${currentStep >= 2 ? "bg-black" : "bg-gray-200"}`} />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <div className={`h-1 w-16 ${currentStep >= 3 ? "bg-black" : "bg-gray-200"}`} />
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 3 ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
            </div>
          </div>

          {/* Payment Error Alert */}
          {paymentError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{paymentError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className={errors.address ? "border-red-500" : ""}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className={errors.city ? "border-red-500" : ""}
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          className={errors.state ? "border-red-500" : ""}
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          className={errors.zipCode ? "border-red-500" : ""}
                        />
                        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <Button onClick={handleNextStep} className="w-full">
                      Continue to Payment
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex items-center gap-2">
                          <span>Razorpay</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Recommended</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi">UPI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod">Cash on Delivery</Label>
                      </div>
                    </RadioGroup>

                    {formData.paymentMethod === "razorpay" && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>Secure Payment with Razorpay</strong>
                        </p>
                        <p className="text-sm text-blue-700">
                          Pay securely using Credit/Debit Cards, Net Banking, UPI, or Wallets through Razorpay's secure
                          payment gateway. All payments are verified for security.
                        </p>
                      </div>
                    )}

                    {formData.paymentMethod === "card" && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nameOnCard">Name on Card</Label>
                          <Input
                            id="nameOnCard"
                            value={formData.nameOnCard}
                            onChange={(e) => handleInputChange("nameOnCard", e.target.value)}
                            className={errors.nameOnCard ? "border-red-500" : ""}
                          />
                          {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
                        </div>

                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                            className={errors.cardNumber ? "border-red-500" : ""}
                          />
                          {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                              id="expiryDate"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                              className={errors.expiryDate ? "border-red-500" : ""}
                            />
                            {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                          </div>
                          <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange("cvv", e.target.value)}
                              className={errors.cvv ? "border-red-500" : ""}
                            />
                            {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === "upi" && (
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input id="upiId" placeholder="yourname@upi" />
                      </div>
                    )}

                    {formData.paymentMethod === "cod" && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Cash on Delivery: Pay when your order is delivered. Additional charges may apply.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Your payment information is secure and encrypted</span>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleSubmitOrder} className="flex-1" disabled={isProcessing}>
                        {isProcessing ? "Processing..." : `Place Order - ₹${total}/-`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-3">
                        <div className="relative">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={50}
                            height={50}
                            className="rounded object-cover"
                          />
                          <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                        </div>
                        <span className="font-medium">₹{item.price * item.quantity}/-</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal}/-</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `₹${shipping}/-`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%)</span>
                      <span>₹{tax}/-</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total}/-</span>
                    </div>
                  </div>

                  {shipping === 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">🎉 You qualify for free shipping!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

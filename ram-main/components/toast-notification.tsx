"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ShoppingCart, Package, UserPlus, Heart, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastNotificationProps {
  id: string
  type: "cart_add" | "order_placed" | "user_signup" | "wishlist_add" | "success" | "error"
  message: string
  onClose: (id: string) => void
  duration?: number
}

export default function ToastNotification({ id, type, message, onClose, duration = 5000 }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100)

    // Auto close
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case "cart_add":
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      case "order_placed":
        return <Package className="h-5 w-5 text-green-500" />
      case "user_signup":
        return <UserPlus className="h-5 w-5 text-purple-500" />
      case "wishlist_add":
        return <Heart className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "cart_add":
        return "bg-blue-50 border-blue-200"
      case "order_placed":
        return "bg-green-50 border-green-200"
      case "user_signup":
        return "bg-purple-50 border-purple-200"
      case "wishlist_add":
        return "bg-red-50 border-red-200"
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <Card
      className={cn(
        "w-80 shadow-lg transition-all duration-300 ease-in-out",
        getBackgroundColor(),
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

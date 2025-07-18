"use client"

import { useState, useEffect } from "react"
import ToastNotification from "./toast-notification"

interface Toast {
  id: string
  type: "cart_add" | "order_placed" | "user_signup" | "wishlist_add" | "success" | "error"
  message: string
}

let toastQueue: Toast[] = []
let setToastsCallback: ((toasts: Toast[]) => void) | null = null

export function showToast(toast: Omit<Toast, "id">) {
  const newToast: Toast = {
    ...toast,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }

  toastQueue = [newToast, ...toastQueue.slice(0, 4)] // Keep max 5 toasts

  if (setToastsCallback) {
    setToastsCallback([...toastQueue])
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    setToastsCallback = setToasts
    return () => {
      setToastsCallback = null
    }
  }, [])

  const removeToast = (id: string) => {
    toastQueue = toastQueue.filter((toast) => toast.id !== id)
    setToasts([...toastQueue])
  }

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut, Package, Heart, Settings, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <Button variant="ghost" className="flex items-center gap-2" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center">
          {user.firstName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block">{user.firstName}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 top-full mt-2 w-64 z-20">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <div className="py-2">
                <button className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50">
                  <Package className="h-4 w-4" />
                  <span>Orders</span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50">
                  <Heart className="h-4 w-4" />
                  <span>Wishlist</span>
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="border-t py-2">
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

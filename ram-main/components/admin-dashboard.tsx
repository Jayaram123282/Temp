"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, ShoppingCart, Package, UserPlus, Heart, MessageSquare, Users, DollarSign, X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { notifications, clearNotifications } = useNotifications()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    cartAdditions: 0,
  })

  useEffect(() => {
    // Calculate stats from notifications
    const orderNotifications = notifications.filter((n) => n.type === "order_placed")
    const userSignups = notifications.filter((n) => n.type === "user_signup")
    const cartAdditions = notifications.filter((n) => n.type === "cart_add")

    const totalRevenue = orderNotifications.reduce((sum, n) => sum + (n.orderValue || 0), 0)

    setStats({
      totalOrders: orderNotifications.length,
      totalRevenue,
      totalUsers: userSignups.length,
      cartAdditions: cartAdditions.length,
    })
  }, [notifications])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "cart_add":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case "order_placed":
        return <Package className="h-4 w-4 text-green-500" />
      case "user_signup":
        return <UserPlus className="h-4 w-4 text-purple-500" />
      case "wishlist_add":
        return <Heart className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "cart_add":
        return "bg-blue-100 text-blue-800"
      case "order_placed":
        return "bg-green-100 text-green-800"
      case "user_signup":
        return "bg-purple-100 text-purple-800"
      case "wishlist_add":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notifications">
                Notifications
                {notifications.length > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{notifications.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sms">SMS Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-3xl font-bold">{stats.totalOrders}</p>
                      </div>
                      <Package className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold">₹{stats.totalRevenue}/-</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Users</p>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cart Additions</p>
                        <p className="text-3xl font-bold">{stats.cartAdditions}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-4">
                      {notifications.slice(0, 10).map((notification) => (
                        <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-sm text-gray-500">{notification.timestamp.toLocaleString()}</p>
                          </div>
                          <Badge className={getNotificationColor(notification.type)}>
                            {notification.type.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">All Notifications</h3>
                <Button variant="outline" onClick={clearNotifications} disabled={notifications.length === 0}>
                  Clear All
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notifications</p>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <p className="font-medium">{notification.message}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{notification.timestamp.toLocaleString()}</span>
                                {notification.userEmail && <span>User: {notification.userEmail}</span>}
                                {notification.productName && <span>Product: {notification.productName}</span>}
                                {notification.orderValue && <span>Value: ₹{notification.orderValue}/-</span>}
                              </div>
                            </div>
                            <Badge className={getNotificationColor(notification.type)}>
                              {notification.type.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    SMS Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">SMS Notifications Enabled For:</h4>
                    <ul className="space-y-1 text-blue-800">
                      <li>✅ New Orders (Immediate SMS)</li>
                      <li>✅ Cart Additions (Real-time SMS)</li>
                      <li>❌ User Signups (Disabled)</li>
                      <li>❌ Wishlist Additions (Disabled)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Admin Phone Number:</h4>
                    <p className="text-green-800 font-mono">{ADMIN_PHONE}</p>
                    <p className="text-sm text-green-700 mt-1">SMS notifications will be sent to this number</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Demo Mode:</h4>
                    <p className="text-yellow-800">
                      Currently running in demo mode. SMS messages are logged to console. To enable real SMS, integrate
                      with Twilio or similar service.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

const ADMIN_PHONE = "+91 7416558069" // This should match the phone number in your API

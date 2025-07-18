"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Heart, Star, Minus, Plus, ShoppingCart, Zap, Truck, Shield } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Product {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  subcategory: string
  subsubcategory?: string
  rating: number
  reviews: number
  isNew?: boolean
  isSale?: boolean
  sizes: string[]
  description?: string
  features?: string[]
  materials?: string[]
}

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, size: string, quantity: number) => void
  onBuyNow: (product: Product, size: string, quantity: number) => void
  onToggleWishlist: (product: Product) => void
  isInWishlist: boolean
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isInWishlist,
}: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState("M")
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<"details" | "features" | "reviews">("details")

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, quantity)
  }

  const handleBuyNow = () => {
    onBuyNow(product, selectedSize, quantity)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0
  const discountPercentage = product.originalPrice ? Math.round((savings / product.originalPrice) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Left side - Product Image */}
          <div className="flex-1 relative bg-gray-50">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
              {product.isSale && <Badge className="bg-red-500 hover:bg-red-600">Sale</Badge>}
              {discountPercentage > 0 && (
                <Badge className="bg-orange-500 hover:bg-orange-600">{discountPercentage}% OFF</Badge>
              )}
            </div>

            <div className="h-full flex items-center justify-center p-8">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={600}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>

          {/* Right side - Product Details */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              {/* Product Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{product.subsubcategory}</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleWishlist(product)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Heart className={cn("h-6 w-6", isInWishlist && "fill-red-500 text-red-500")} />
                  </Button>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price}/-</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}/-</span>
                      <span className="text-sm font-medium text-green-600">Save ₹{savings}/-</span>
                    </>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      className={cn("h-10 w-10", selectedSize === size ? "bg-black text-white" : "hover:border-black")}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Size guide available</p>
              </div>

              {/* Quantity Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-transparent"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-transparent"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button onClick={handleBuyNow} className="w-full h-12 text-base font-medium">
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now - ₹{product.price * quantity}/-
                </Button>
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-black hover:bg-black hover:text-white bg-transparent"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Product Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping on orders above ₹1500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Secure payments</span>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Product Tabs */}
              <div className="space-y-4">
                <div className="flex gap-4 border-b">
                  <button
                    className={cn(
                      "pb-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "details"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                    )}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>
                  <button
                    className={cn(
                      "pb-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "features"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                    )}
                    onClick={() => setActiveTab("features")}
                  >
                    Features
                  </button>
                  <button
                    className={cn(
                      "pb-2 text-sm font-medium border-b-2 transition-colors",
                      activeTab === "reviews"
                        ? "border-black text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                    )}
                    onClick={() => setActiveTab("reviews")}
                  >
                    Reviews
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  {activeTab === "details" && (
                    <div className="space-y-3">
                      <p>
                        This premium graphic tee is crafted from 100% cotton for ultimate comfort and durability.
                        Perfect for casual wear or making a statement.
                      </p>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Materials:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>100% Premium Cotton</li>
                          <li>Pre-shrunk fabric</li>
                          <li>Reinforced seams</li>
                          <li>Tagless for comfort</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "features" && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>High-quality screen printing</li>
                          <li>Fade-resistant colors</li>
                          <li>Machine washable</li>
                          <li>Comfortable fit</li>
                          <li>Breathable fabric</li>
                          <li>Durable construction</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Care Instructions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Machine wash cold</li>
                          <li>Tumble dry low</li>
                          <li>Do not bleach</li>
                          <li>Iron inside out</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
                        <p className="text-gray-500">Be the first to review this product!</p>
                      </div>
                      <Button variant="outline" className="mt-4 bg-transparent">
                        Write a Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

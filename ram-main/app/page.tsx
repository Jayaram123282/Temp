"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Heart, ShoppingBag, Menu, X, User, Plus, Minus, Trash2, ChevronDown, Bell } from "lucide-react"
import Image from "next/image"
import Checkout from "@/components/checkout"
import AuthModal from "@/components/auth-modal"
import UserMenu from "@/components/user-menu"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { NotificationProvider, useNotifications } from "@/contexts/notification-context"
import ToastContainer from "@/components/toast-container"
import { showToast } from "@/components/toast-container"
import AdminDashboard from "@/components/admin-dashboard"
import ProductModal from "@/components/product-modal"

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
}

interface CartItem extends Product {
  quantity: number
  selectedSize: string
}

interface WishlistItem extends Product {}

const products: Product[] = [
  {
    id: 1,
    name: "Never Stop Trying Graphic Tee",
    price: 899,
    originalPrice: 1299,
    image: "/images/tshirt1.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Oversized",
    rating: 4.8,
    reviews: 0,
    isNew: true,
    isSale: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "Naruto Uzumaki Anime Tee",
    price: 899,
    image: "/images/tshirt2.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Casual",
    rating: 4.5,
    reviews: 0,
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 3,
    name: "Tiger Fire Graphic Tee",
    price: 899,
    image: "/images/tshirt3.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Acid Washed",
    rating: 4.7,
    reviews: 0,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 4,
    name: "Monaliza Art Print Tee",
    price: 899,
    originalPrice: 1199,
    image: "/images/tshirt4.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Oversized",
    rating: 4.9,
    reviews: 0,
    isSale: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: "McLaren Mp4/4 Racing Tee",
    price: 999,
    originalPrice: 1399,
    image: "/images/tshirt7.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Motorsport",
    rating: 4.9,
    reviews: 0,
    isNew: true,
    isSale: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 6,
    name: "Chrome Flame Abstract Tee",
    price: 899,
    image: "/images/tshirt8.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Abstract",
    rating: 4.6,
    reviews: 0,
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 7,
    name: "Red Spider Web Gothic Tee",
    price: 899,
    image: "/images/tshirt9.png",
    category: "T-Shirts",
    subcategory: "T-Shirts",
    subsubcategory: "Gothic",
    rating: 4.7,
    reviews: 0,
    isNew: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
]

function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onProductClick,
  isInWishlist,
}: {
  product: Product
  onAddToCart: (product: Product, size: string) => void
  onToggleWishlist: (product: Product) => void
  onProductClick: (product: Product) => void
  isInWishlist: boolean
}) {
  const [selectedSize, setSelectedSize] = useState("M")
  const [showSizes, setShowSizes] = useState(false)

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={400}
          className="h-64 w-full object-contain transition-transform group-hover:scale-105 bg-gray-50"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
          {product.isSale && <Badge className="bg-red-500 hover:bg-red-600">Sale</Badge>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation()
            onToggleWishlist(product)
          }}
        >
          <Heart className={cn("h-4 w-4", isInWishlist && "fill-red-500 text-red-500")} />
        </Button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {!showSizes ? (
            <Button
              className="w-full bg-white text-black hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                setShowSizes(true)
              }}
            >
              Select Size
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2 justify-center">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      selectedSize === size ? "bg-white text-black" : "bg-white/80 text-black hover:bg-white",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedSize(size)
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <Button
                className="w-full bg-white text-black hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddToCart(product, selectedSize)
                  setShowSizes(false)
                }}
              >
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-4 cursor-pointer" onClick={() => onProductClick(product)}>
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.subsubcategory}</p>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">₹{product.price}/-</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}/-</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ClothingBrandWebsiteContent() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login")
  const [orderData, setOrderData] = useState(null)
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false)
  const [showTshirtDropdown, setShowTshirtDropdown] = useState(false)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  const { addNotification } = useNotifications()

  const addToCart = (product: Product, size: string) => {
    const existingItem = cart.find((item) => item.id === product.id && item.selectedSize === size)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id && item.selectedSize === size ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      )
    } else {
      setCart([...cart, { ...product, quantity: 1, selectedSize: size }])
    }

    // Add notification
    addNotification({
      type: "cart_add",
      message: `${product.name} added to cart`,
      userEmail: user?.email,
      productName: product.name,
    })

    // Show toast
    showToast({
      type: "cart_add",
      message: `${product.name} added to cart!`,
    })
  }

  const updateCartQuantity = (id: number, size: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => !(item.id === id && item.selectedSize === size)))
    } else {
      setCart(
        cart.map((item) => (item.id === id && item.selectedSize === size ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  const removeFromCart = (id: number, size: string) => {
    setCart(cart.filter((item) => !(item.id === id && item.selectedSize === size)))
  }

  const toggleWishlist = (product: Product) => {
    const isInWishlist = wishlist.some((item) => item.id === product.id)
    if (isInWishlist) {
      setWishlist(wishlist.filter((item) => item.id !== product.id))
      showToast({
        type: "wishlist_add",
        message: `${product.name} removed from wishlist`,
      })
    } else {
      setWishlist([...wishlist, product])

      // Add notification
      addNotification({
        type: "wishlist_add",
        message: `${product.name} added to wishlist`,
        userEmail: user?.email,
        productName: product.name,
      })

      showToast({
        type: "wishlist_add",
        message: `${product.name} added to wishlist!`,
      })
    }
  }

  const removeFromWishlist = (id: number) => {
    setWishlist(wishlist.filter((item) => item.id !== id))
  }

  const handleProceedToCheckout = () => {
    if (!user) {
      setAuthModalTab("login")
      setShowAuthModal(true)
      return
    }
    setShowCart(false)
    setShowCheckout(true)
  }

  const handleOrderComplete = (data: any) => {
    setOrderData(data)
    setCart([]) // Clear cart after successful order
  }

  const handleBackToShopping = () => {
    setShowCheckout(false)
    setOrderData(null)
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleBuyNow = (product: Product, size: string, quantity: number) => {
    // Add items to cart first
    for (let i = 0; i < quantity; i++) {
      addToCart(product, size)
    }

    // Then proceed to checkout
    if (!user) {
      setAuthModalTab("login")
      setShowAuthModal(true)
      return
    }
    setShowProductModal(false)
    setShowCheckout(true)
  }

  const handleModalAddToCart = (product: Product, size: string, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, size)
    }
    setShowProductModal(false)
  }

  if (showCheckout) {
    return <Checkout cart={cart} onBack={handleBackToShopping} onOrderComplete={handleOrderComplete} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">RAM</h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                  Home
                </a>

                {/* Categories Dropdown */}
                <div className="relative">
                  <button
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium"
                    onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                    onMouseEnter={() => setShowCategoriesDropdown(true)}
                  >
                    Categories
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showCategoriesDropdown && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50"
                      onMouseLeave={() => {
                        setShowCategoriesDropdown(false)
                        setShowTshirtDropdown(false)
                      }}
                    >
                      <div className="py-2">
                        {/* T-Shirts with sub-dropdown */}
                        <div className="relative">
                          <button
                            className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                            onMouseEnter={() => setShowTshirtDropdown(true)}
                          >
                            T-Shirts
                            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                          </button>

                          {showTshirtDropdown && (
                            <div className="absolute left-full top-0 ml-1 w-48 bg-white border rounded-lg shadow-lg">
                              <div className="py-2">
                                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                                  Oversized
                                </a>
                                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                                  Casual
                                </a>
                                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                                  Acid Washed
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Hoodies
                        </a>
                        <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Sweat Shirts
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <a href="#about" className="text-gray-700 hover:text-gray-900 font-medium">
                  About
                </a>
                <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium">
                  Contact
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setShowWishlist(true)} className="relative">
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {wishlist.length}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setShowCart(true)} className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setAuthModalTab("login")
                    setShowAuthModal(true)
                  }}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}

              {/* Admin Dashboard Button - Only show for demo */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminDashboard(true)}
                className="hidden md:flex items-center gap-2 text-xs"
              >
                <Bell className="h-4 w-4" />
                Admin
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4">
              <div className="flex flex-col gap-4">
                <nav className="flex flex-col gap-2">
                  <a href="#" className="text-gray-700 hover:text-gray-900 font-medium py-2">
                    Home
                  </a>

                  {/* Mobile Categories */}
                  <div className="py-2">
                    <button
                      className="flex items-center justify-between w-full text-gray-700 hover:text-gray-900 font-medium"
                      onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                    >
                      Categories
                      <ChevronDown
                        className={cn("h-4 w-4 transition-transform", showCategoriesDropdown && "rotate-180")}
                      />
                    </button>

                    {showCategoriesDropdown && (
                      <div className="mt-2 ml-4 space-y-2">
                        <div>
                          <button
                            className="flex items-center justify-between w-full text-gray-600 hover:text-gray-900 py-1"
                            onClick={() => setShowTshirtDropdown(!showTshirtDropdown)}
                          >
                            T-Shirts
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", showTshirtDropdown && "rotate-180")}
                            />
                          </button>

                          {showTshirtDropdown && (
                            <div className="mt-1 ml-4 space-y-1">
                              <a href="#" className="block text-gray-500 hover:text-gray-900 py-1">
                                Oversized
                              </a>
                              <a href="#" className="block text-gray-500 hover:text-gray-900 py-1">
                                Casual
                              </a>
                              <a href="#" className="block text-gray-500 hover:text-gray-900 py-1">
                                Acid Washed
                              </a>
                            </div>
                          )}
                        </div>

                        <a href="#" className="block text-gray-600 hover:text-gray-900 py-1">
                          Hoodies
                        </a>
                        <a href="#" className="block text-gray-600 hover:text-gray-900 py-1">
                          Sweat Shirts
                        </a>
                      </div>
                    )}
                  </div>

                  <a href="#about" className="text-gray-700 hover:text-gray-900 font-medium py-2">
                    About
                  </a>
                  <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium py-2">
                    Contact
                  </a>

                  {!user && (
                    <div className="pt-2 border-t">
                      <Button
                        variant="outline"
                        className="w-full mb-2 bg-transparent"
                        onClick={() => {
                          setAuthModalTab("login")
                          setShowAuthModal(true)
                          setIsMenuOpen(false)
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setAuthModalTab("signup")
                          setShowAuthModal(true)
                          setIsMenuOpen(false)
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="bg-black py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Premium Fashion Collection
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover our curated selection of contemporary clothing designed for the modern lifestyle
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex-1">
            <p className="text-gray-600 mb-6">Showing 7 products</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onProductClick={handleProductClick}
                  isInWishlist={wishlist.some((item) => item.id === product.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About RAM</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Founded with a passion for contemporary fashion, RAM is more than just a clothing brand – we're a creative
              laboratory where art meets apparel. Our mission is to bring you unique, high-quality graphic tees that
              express your individuality and make a statement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Creative Design</h3>
                <p className="text-gray-600">
                  Each design is carefully crafted by our team of artists, ensuring every piece tells a unique story.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  We use only the finest materials and printing techniques to ensure durability and comfort.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Love</h3>
                <p className="text-gray-600">
                  Your satisfaction is our priority. We're committed to providing exceptional service and support.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
              <p className="text-gray-600 leading-relaxed">
                RAM was born from the idea that clothing should be a canvas for self-expression. We believe that what
                you wear should reflect who you are – bold, creative, and unapologetically unique. From anime-inspired
                designs to abstract art prints, our collection celebrates the diverse interests and personalities of our
                community. Every t-shirt is a piece of wearable art, designed to spark conversations and inspire
                confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Have questions about our products or need assistance? We're here to help! Reach out to us through any of
              the following channels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600 mb-4">Call us for immediate assistance Jayaram</p>
                <a
                  href="tel:+917416558067"
                  className="text-lg font-semibold text-black hover:text-gray-700 transition-colors"
                >
                  +91 7416558067
                </a>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 mb-4">Send us a message anytime</p>
                <a
                  href="mailto:Sriramgaddam1221@gmail.com"
                  className="text-lg font-semibold text-black hover:text-gray-700 transition-colors break-all"
                >
                  Sriramgaddam1221@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${item.selectedSize}`}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                          <p className="font-semibold">₹{item.price}/-</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeFromCart(item.id, item.selectedSize)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">₹{cartTotal}/-</span>
                    </div>
                    <Button className="w-full" onClick={handleProceedToCheckout}>
                      Proceed to Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Sidebar */}
      {showWishlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Wishlist</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowWishlist(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {wishlist.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your wishlist is empty</p>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="font-semibold">₹{item.price}/-</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />

      {/* Admin Dashboard */}
      <AdminDashboard isOpen={showAdminDashboard} onClose={() => setShowAdminDashboard(false)} />

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onAddToCart={handleModalAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={toggleWishlist}
        isInWishlist={selectedProduct ? wishlist.some((item) => item.id === selectedProduct.id) : false}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">RAM</h3>
              <p className="text-gray-400">
                Premium fashion for the modern lifestyle. Quality, style, and comfort in every piece.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    T-Shirts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Hoodies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Sweat Shirts
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    New Arrivals
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Returns
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Shipping
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RAM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function ClothingBrandWebsite() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ClothingBrandWebsiteContent />
        <ToastContainer />
      </NotificationProvider>
    </AuthProvider>
  )
}

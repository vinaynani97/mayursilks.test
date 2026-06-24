"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Heart, ShoppingBag, Star, ChevronRight, Truck, Shield, RotateCcw,
  Phone, Check, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatPrice, calculateDiscount, getCloudinaryUrl } from "@/lib/utils";
import ProductCard from "@/components/storefront/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/types/index";

type Review = { id: string; rating: number; comment: string; author: string; createdAt: string };
type DetailProduct = Product & { reviews?: Review[] };

interface Props {
  product: DetailProduct;
  related: Product[];
}

const tabs = ["Description", "Details", "Shipping", "Reviews"];

export default function ProductDetailClient({ product, related }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("Description");
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();
  const { addItem, isLoading } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
  const images = product.images.length > 0 ? product.images : [];
  const hasImages = images.length > 0;

  function checkPincode() {
    if (pincode.length !== 6) { setPincodeMsg("Enter a valid 6-digit pincode"); return; }
    setPincodeMsg("✓ Delivery available in 5-7 business days");
  }

  async function handleAddToCart() {
    await addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images,
      slug: product.slug,
      sku: product.sku,
      category: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  async function handleWishlist() {
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }
    await toggle(product.id);
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 font-jost text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-primary-500 transition-colors">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/products?category=${product.categorySlug}`} className="hover:text-primary-500 transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 relative">
              {hasImages ? (
                <Image
                  src={getCloudinaryUrl(images[selectedImage], 1200, 1500)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="font-josefin text-primary-300 text-4xl">M</span>
                    </div>
                    <p className="font-jost text-primary-300 text-sm">{product.name}</p>
                  </div>
                </div>
              )}
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-secondary-400 text-primary-900 text-xs font-josefin font-bold px-3 py-1 rounded-full uppercase tracking-wide">New</span>
              )}
            </div>
            {hasImages && images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={cn("w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all", selectedImage === i ? "border-primary-500" : "border-transparent opacity-70 hover:opacity-100")}>
                    <Image src={getCloudinaryUrl(img, 160, 192, "auto:good")} alt={`${product.name} ${i + 1}`} width={80} height={96} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <span className="font-mono text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{product.sku}</span>

              <h1 className="font-josefin text-2xl md:text-3xl font-semibold text-gray-900 mt-4 mb-3 leading-snug">{product.name}</h1>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < Math.floor(product.rating) ? "fill-secondary-400 text-secondary-400" : "fill-gray-100 text-gray-200")} />
                  ))}
                </div>
                <span className="font-jost text-sm text-gray-500">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-end gap-3 mb-6">
                <span className="font-josefin text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="font-jost text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="font-jost text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{discount}% OFF</span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-cream-100 rounded-2xl">
                {[
                  { label: "Fabric", value: product.fabric },
                  { label: "Color", value: product.color },
                  { label: "Length", value: product.length },
                  { label: "Category", value: product.category },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="font-jost text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="font-jost text-sm font-medium text-gray-900 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-2">
                <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-jost font-medium w-fit",
                  product.availability === "in_stock" && product.stock > 5 ? "bg-green-50 text-green-700" :
                  product.availability === "in_stock" && product.stock > 0 ? "bg-orange-50 text-orange-700" :
                  product.availability === "made_to_order" ? "bg-yellow-50 text-yellow-700" :
                  "bg-red-50 text-red-700"
                )}>
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                    product.availability === "in_stock" && product.stock > 5 ? "bg-green-500" :
                    product.availability === "in_stock" && product.stock > 0 ? "bg-orange-500" :
                    product.availability === "made_to_order" ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  {product.availability === "out_of_stock"
                    ? "Out of Stock"
                    : product.availability === "made_to_order"
                    ? "Made to Order (15–20 days)"
                    : product.stock <= 5
                    ? `Only ${product.stock} piece${product.stock !== 1 ? "s" : ""} left!`
                    : "In Stock"}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mb-6">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isLoading || product.availability === "out_of_stock"}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex-1 h-13 font-jost font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed",
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-primary-500 hover:bg-primary-600 text-white"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" /> Added to Cart!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  onClick={handleWishlist}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-13 h-13 rounded-2xl border-2 flex items-center justify-center transition-all p-3.5",
                    wishlisted
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-gray-200 text-gray-400 hover:border-primary-300"
                  )}
                >
                  <motion.div
                    animate={{ scale: wishlisted ? [1, 1.4, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={cn("w-5 h-5", wishlisted ? "fill-current" : "")} />
                  </motion.div>
                </motion.button>
              </div>

              <a
                href={`https://wa.me/919652803383?text=Hi! I'm interested in ${product.name} (SKU: ${product.sku}). Price: ${formatPrice(product.price)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-jost font-medium py-3.5 rounded-2xl transition-all mb-6"
              >
                <Phone className="w-5 h-5" /> Order via WhatsApp
              </a>

              {/* Pincode Checker */}
              <div className="border border-gray-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-jost text-sm font-medium text-gray-700">Check Delivery Availability</span>
                </div>
                <div className="flex gap-2">
                  <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter pincode" className="flex-1 h-9 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                  <button onClick={checkPincode} className="px-4 h-9 bg-primary-500 text-white font-jost text-sm rounded-xl hover:bg-primary-600 transition-colors">Check</button>
                </div>
                {pincodeMsg && <p className={cn("font-jost text-xs mt-2", pincodeMsg.startsWith("✓") ? "text-green-600" : "text-red-500")}>{pincodeMsg}</p>}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "On orders ₹999+" },
                  { icon: Shield, label: "Authentic", sub: "100% genuine" },
                  { icon: RotateCcw, label: "Easy Returns", sub: "7-day returns" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="text-center p-3 bg-cream-100 rounded-xl">
                    <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                    <p className="font-jost text-xs font-medium text-gray-700">{label}</p>
                    <p className="font-jost text-[10px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("flex-1 py-4 font-jost text-sm font-medium transition-colors", activeTab === tab ? "text-primary-500 border-b-2 border-primary-500" : "text-gray-500 hover:text-gray-700")}
              >
                {tab} {tab === "Reviews" && `(${product.reviewCount})`}
              </button>
            ))}
          </div>
          <div className="p-8">
            {activeTab === "Description" && <p className="font-jost text-gray-600 leading-relaxed">{product.description}</p>}
            {activeTab === "Details" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Fabric", value: product.fabric },
                  { label: "Weaving Technique", value: product.weavingTechnique },
                  { label: "Length", value: product.length },
                  { label: "Color", value: product.color },
                  { label: "Category", value: product.category },
                  { label: "Design Details", value: product.designDetails },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3 p-4 bg-cream-100 rounded-xl">
                    <span className="font-jost text-sm font-semibold text-gray-700 min-w-32">{label}:</span>
                    <span className="font-jost text-sm text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "Shipping" && (
              <div className="space-y-4 font-jost text-gray-600">
                <p><strong className="text-gray-900">Standard Delivery:</strong> 5-7 business days</p>
                <p><strong className="text-gray-900">Express Delivery:</strong> 2-3 business days (additional charges)</p>
                <p><strong className="text-gray-900">Made-to-Order:</strong> 15-20 business days</p>
                <p><strong className="text-gray-900">Free Shipping:</strong> On orders above ₹999</p>
                <p><strong className="text-gray-900">Returns:</strong> 7-day hassle-free returns on unused sarees in original packaging</p>
              </div>
            )}
            {activeTab === "Reviews" && (
              <div>
                {(!product.reviews || product.reviews.length === 0) ? (
                  <div className="text-center py-8">
                    <p className="font-jost text-gray-400">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {product.reviews?.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="font-josefin font-bold text-primary-500 text-sm">{review.author?.[0]?.toUpperCase()}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-jost text-sm font-medium text-gray-900">{review.author}</p>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("w-3.5 h-3.5", i < review.rating ? "fill-secondary-400 text-secondary-400" : "fill-gray-100 text-gray-200")} />
                                ))}
                              </div>
                            </div>
                            <p className="font-jost text-sm text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-josefin text-2xl font-semibold text-gray-900">More from {product.category}</h2>
              <Link href={`/products?category=${product.categorySlug}`} className="font-jost text-sm text-primary-500 hover:text-primary-700 transition-colors">View all</Link>
            </div>
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

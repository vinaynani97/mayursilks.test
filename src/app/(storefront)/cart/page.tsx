"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getCloudinaryUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, updateItem, removeItem } = useCart();
  const [isPending] = useTransition();

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center py-20 px-4">
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-primary-200" />
          </div>
          <h2 className="font-josefin text-2xl font-semibold text-gray-900 mb-3">
            Your Cart is Empty
          </h2>
          <p className="font-jost text-gray-500 mb-8">
            Discover our exquisite collection of handloom silk sarees
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-jost font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-luxury-gradient py-10 px-4 text-center">
        <h1 className="font-josefin text-3xl font-light text-white">Shopping Cart</h1>
        <p className="font-jost text-white/70 mt-1">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence initial={false}>
              {items.map(({ id, product, quantity }) => (
                <motion.div
                  key={id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-5"
                >
                  {/* Image */}
                  <div className="w-24 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0 relative">
                    {product.images[0] ? (
                      <Image
                        src={getCloudinaryUrl(product.images[0], 192, 224)}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-primary-200" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-jost text-xs text-gray-400 mb-1">{product.category}</p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-jost font-medium text-gray-900 text-sm line-clamp-2 mb-1 hover:text-primary-500 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="font-jost text-xs text-gray-400 mb-3">SKU: {product.sku}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateItem(id, quantity - 1)}
                          disabled={isPending}
                          className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-jost font-medium text-sm w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateItem(id, quantity + 1)}
                          disabled={isPending}
                          className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-josefin font-bold text-primary-500">
                          {formatPrice(product.price * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-jost text-sm text-primary-500 hover:text-primary-700 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit sticky top-24">
            <h3 className="font-josefin text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

            {/* Coupon note — applied at checkout */}
            <div className="mb-6 flex items-center gap-2 px-3 py-2.5 bg-primary-50 border border-primary-100 rounded-xl">
              <Tag className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              <p className="font-jost text-xs text-primary-600">
                Have a coupon? Apply it at checkout for your discount.
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm font-jost border-t border-gray-100 pt-5 mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
            </div>

            <div className="flex justify-between font-josefin font-bold text-gray-900 text-lg border-t border-gray-100 pt-4 mb-6">
              <span>Total</span>
              <span className="text-primary-500">{formatPrice(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-jost font-semibold py-3.5 rounded-xl transition-colors mb-3"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="https://wa.me/919652803383"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-green-500 text-green-600 hover:bg-green-50 py-2.5 rounded-xl font-jost text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Order via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

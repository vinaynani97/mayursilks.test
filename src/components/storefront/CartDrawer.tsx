"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice, getCloudinaryUrl } from "@/lib/utils";

export default function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, updateItem, removeItem } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
                <h2 className="font-josefin text-lg font-semibold text-gray-900">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center font-josefin">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-5">
                  <ShoppingBag className="w-10 h-10 text-primary-200" />
                </div>
                <h3 className="font-josefin text-xl font-semibold text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="font-jost text-sm text-gray-400 mb-8">
                  Discover our handwoven silk saree collection
                </p>
                <button
                  onClick={closeCart}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-jost font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  Browse Collection
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                        className="flex gap-4 bg-gray-50 rounded-2xl p-3"
                      >
                        {/* Image */}
                        <div className="w-20 h-24 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0 relative">
                          {item.product.images[0] ? (
                            <Image
                              src={getCloudinaryUrl(item.product.images[0], 160, 192)}
                              alt={item.product.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-primary-200" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-jost text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                            {item.product.category}
                          </p>
                          <Link
                            href={`/products/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-jost text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-500 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <p className="font-josefin font-bold text-primary-500 mt-1 text-sm">
                            {formatPrice(item.product.price)}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-2 py-0.5 bg-white">
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-jost text-sm font-medium w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-josefin text-sm font-bold text-gray-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-300 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-jost text-sm text-gray-500">
                        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                      </p>
                      <p className="font-josefin text-xl font-bold text-gray-900">
                        {formatPrice(subtotal)}
                      </p>
                    </div>
                    <p className="font-jost text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      Free shipping
                    </p>
                  </div>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="flex items-center justify-center gap-2 w-full bg-primary-500 hover:bg-primary-600 text-white font-jost font-semibold py-3.5 rounded-xl transition-colors"
                  >
                    View Cart & Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

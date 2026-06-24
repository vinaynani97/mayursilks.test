"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ShoppingBag, MessageCircle } from "lucide-react";

export default function CheckoutFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "Payment was not completed";

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 16 }}
        className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <XCircle className="w-10 h-10 text-red-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h1 className="font-josefin text-2xl font-bold text-gray-900 mb-3">
          Payment Failed
        </h1>
        <p className="font-jost text-gray-500 text-sm mb-2">
          {reason}
        </p>
        <p className="font-jost text-gray-400 text-xs mb-8">
          Your cart is still saved. No amount has been charged.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-jost font-semibold py-3.5 rounded-xl transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-jost font-medium py-3.5 rounded-xl transition-colors text-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Back to Cart
          </Link>
          <a
            href="https://wa.me/919652803383"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-green-500 text-green-600 hover:bg-green-50 font-jost font-medium py-3.5 rounded-xl transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" /> Get Help on WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}

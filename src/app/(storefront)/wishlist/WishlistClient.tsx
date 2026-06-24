"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice, getCloudinaryUrl } from "@/lib/utils";
import type { Product } from "@/types";

export default function WishlistClient({ initialProducts }: { initialProducts: Product[] }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle, isLoaded } = useWishlist();
  const [movingId, setMovingId] = useState<string | null>(null);

  // After context loads, only show products that are still in wishlist
  const products = isLoaded
    ? initialProducts.filter((p) => isWishlisted(p.id))
    : initialProducts;

  async function handleMoveToCart(product: Product) {
    setMovingId(product.id);
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
    await toggle(product.id);
    setMovingId(null);
  }

  async function handleRemove(productId: string) {
    await toggle(productId);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-12 h-12 text-primary-200" />
        </div>
        <h2 className="font-josefin text-2xl font-semibold text-gray-900 mb-3">
          Your Wishlist is Empty
        </h2>
        <p className="font-jost text-gray-500 mb-8">
          Save your favourite sarees to discover them later
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-jost font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Browse Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      <AnimatePresence initial={false}>
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-primary-50 to-primary-100">
              {product.images[0] ? (
                <Image
                  src={getCloudinaryUrl(product.images[0], 400, 500)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-primary-200" />
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="font-jost text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                {product.category}
              </p>
              <Link
                href={`/products/${product.slug}`}
                className="font-jost text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary-500 transition-colors"
              >
                {product.name}
              </Link>
              <p className="font-josefin font-bold text-primary-500 mt-1.5 mb-3">
                {formatPrice(product.price)}
              </p>

              <button
                onClick={() => handleMoveToCart(product)}
                disabled={movingId === product.id}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost text-xs font-medium py-2.5 rounded-xl transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {movingId === product.id ? "Moving..." : "Move to Cart"}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

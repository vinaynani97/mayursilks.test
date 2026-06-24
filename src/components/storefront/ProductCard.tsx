"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star, Check } from "lucide-react";
import { cn, formatPrice, calculateDiscount, getCloudinaryUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { addItem, isLoading } = useCart();
  const { isWishlisted, toggle } = useWishlist();

  const wishlisted = isWishlisted(product.id);
  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const primaryImage = product.images?.[0] ?? null;
  const optimizedSrc = primaryImage ? getCloudinaryUrl(primaryImage, 400, 500) : null;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    await toggle(product.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100">
        {optimizedSrc ? (
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Image
              src={optimizedSrc}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-1/2 h-1/2 text-primary-200" fill="currentColor">
              <rect x="10" y="5" width="80" height="110" rx="4" fill="currentColor" opacity="0.3" />
              <path d="M20 30 Q50 10 80 30 L80 80 Q50 100 20 80 Z" fill="currentColor" opacity="0.5" />
            </svg>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="font-josefin text-primary-300 text-sm font-medium">
                {product.color.split(" ")[0]}
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && <Badge variant="new">NEW</Badge>}
          {product.isBestSeller && <Badge variant="bestseller">BESTSELLER</Badge>}
          {product.availability === "out_of_stock" && (
            <span className="bg-gray-800 text-white text-[10px] font-jost font-semibold px-2 py-1 rounded-sm">
              OUT OF STOCK
            </span>
          )}
          {product.availability !== "out_of_stock" && product.stock > 0 && product.stock <= 5 && (
            <span className="bg-orange-500 text-white text-[10px] font-jost font-semibold px-2 py-1 rounded-sm">
              ONLY {product.stock} LEFT
            </span>
          )}
        </div>
        {discount > 0 && (
          <Badge variant="sale" className="absolute top-3 right-12 z-10">
            -{discount}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
        >
          <motion.div
            animate={{ scale: wishlisted ? [1, 1.5, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                wishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
              )}
            />
          </motion.div>
        </motion.button>

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center gap-3"
        >
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full text-xs font-jost font-medium hover:bg-primary-500 hover:text-white transition-all shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </Link>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="font-jost text-xs text-gray-400 uppercase tracking-wider mb-1.5">
          {product.category}
        </p>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-jost text-gray-900 text-sm font-medium leading-snug mb-2 hover:text-primary-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < Math.floor(product.rating)
                    ? "fill-secondary-400 text-secondary-400"
                    : "text-gray-200"
                )}
              />
            ))}
          </div>
          <span className="font-jost text-xs text-gray-400">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-josefin font-bold text-primary-500 text-lg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-jost text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.availability === "out_of_stock"}
            className={cn(
              "w-9 h-9 rounded-full text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
              justAdded
                ? "bg-green-500 shadow-green-500/30"
                : "bg-primary-500 hover:bg-primary-600 shadow-primary-500/30"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="bag"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <ShoppingBag className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <p className="font-jost text-[10px] text-gray-300 mt-1.5">{product.sku}</p>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/index";

const tabs = [
  { label: "New Arrivals", filter: "new" },
  { label: "Best Sellers", filter: "bestseller" },
  { label: "Featured", filter: "featured" },
];

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("new");

  const filtered = products.filter((p) => {
    if (activeTab === "new") return p.isNew;
    if (activeTab === "bestseller") return p.isBestSeller;
    if (activeTab === "featured") return p.isFeatured;
    return true;
  });

  return (
    <section className="luxury-section bg-white">
      <div className="container-luxury">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-[1px] bg-secondary-500" />
              <span className="font-jost text-secondary-600 text-xs tracking-[0.3em] uppercase">
                Handpicked
              </span>
            </div>
            <h2 className="heading-section text-gray-900">Our Collections</h2>
          </div>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 font-jost text-sm font-medium text-primary-500 hover:text-primary-700 border-b border-primary-500/30 hover:border-primary-500 pb-0.5 transition-all"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mb-8 p-1 bg-gray-100 rounded-full w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.filter}
              onClick={() => setActiveTab(tab.filter)}
              className={`relative px-5 py-2 rounded-full text-sm font-jost font-medium transition-all duration-200 ${
                activeTab === tab.filter
                  ? "bg-white text-primary-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 font-jost">
              No products in this section yet. Add some from the admin dashboard.
            </div>
          )}
        </motion.div>

        {/* Mobile View All */}
        <div className="text-center mt-8 sm:hidden">
          <Button asChild variant="outline">
            <Link href="/products">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Search, X } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import type { Product } from "@/types/index";

const priceRanges = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000 },
  { label: "₹15,000 – ₹20,000", min: 15000, max: 20000 },
  { label: "Above ₹20,000", min: 20000, max: Infinity },
];

const sortOptions = [
  { label: "Latest First", value: "latest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Best Rated", value: "rated" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const filterParam = searchParams.get("filter") || "";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [showNew, setShowNew] = useState(filterParam === "new");
  const [showBestSeller, setShowBestSeller] = useState(filterParam === "bestseller");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
        setAllProducts(pData.products ?? []);
        setCategories(cData.categories ?? []);
      } catch {
        setAllProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.color.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory) result = result.filter((p) => p.categorySlug === selectedCategory);
    if (showNew) result = result.filter((p) => p.isNew);
    if (showBestSeller) result = result.filter((p) => p.isBestSeller);
    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.label === selectedPriceRange);
      if (range) result = result.filter((p) => p.price >= range.min && p.price < range.max);
    }
    switch (sortBy) {
      case "price-asc": return [...result].sort((a, b) => a.price - b.price);
      case "price-desc": return [...result].sort((a, b) => b.price - a.price);
      case "popular": return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
      case "rated": return [...result].sort((a, b) => b.rating - a.rating);
      default: return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [allProducts, search, selectedCategory, showNew, showBestSeller, selectedPriceRange, sortBy]);

  const clearFilters = () => { setSearch(""); setSelectedCategory(""); setSelectedPriceRange(""); setShowNew(false); setShowBestSeller(false); };
  const hasFilters = search || selectedCategory || selectedPriceRange || showNew || showBestSeller;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-200 rounded-2xl h-72" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-josefin font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs font-jost text-primary-500 flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <div className="mb-6">
              <h4 className="font-jost font-semibold text-xs text-gray-700 mb-3 uppercase tracking-wide">Category</h4>
              <div className="space-y-1">
                <button onClick={() => setSelectedCategory("")} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-jost transition-colors", !selectedCategory ? "bg-primary-50 text-primary-500 font-medium" : "text-gray-600 hover:bg-gray-50")}>All Categories</button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-jost transition-colors", selectedCategory === cat.slug ? "bg-primary-50 text-primary-500 font-medium" : "text-gray-600 hover:bg-gray-50")}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-jost font-semibold text-xs text-gray-700 mb-3 uppercase tracking-wide">Price Range</h4>
              <div className="space-y-1">
                {priceRanges.map((range) => (
                  <button key={range.label} onClick={() => setSelectedPriceRange(selectedPriceRange === range.label ? "" : range.label)} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm font-jost transition-colors", selectedPriceRange === range.label ? "bg-primary-50 text-primary-500 font-medium" : "text-gray-600 hover:bg-gray-50")}>
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-jost font-semibold text-xs text-gray-700 mb-3 uppercase tracking-wide">Quick Filters</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={showNew} onChange={(e) => setShowNew(e.target.checked)} className="w-4 h-4 accent-primary-500" />
                  <span className="font-jost text-sm text-gray-600">New Arrivals</span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={showBestSeller} onChange={(e) => setShowBestSeller(e.target.checked)} className="w-4 h-4 accent-primary-500" />
                  <span className="font-jost text-sm text-gray-600">Best Sellers</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search sarees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 px-3 text-sm font-jost border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white">
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <span className="hidden sm:block font-jost text-sm text-gray-500 flex-shrink-0">{filtered.length} sarees</span>
            </div>
          </div>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="lg:hidden bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-jost font-semibold text-xs text-gray-500 mb-2 uppercase">Category</h4>
                  <div className="space-y-1">
                    {categories.slice(0, 4).map((cat) => (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.slug === selectedCategory ? "" : cat.slug)} className={cn("w-full text-left px-2 py-1.5 rounded-lg text-xs font-jost", selectedCategory === cat.slug ? "bg-primary-50 text-primary-500" : "text-gray-600")}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-jost font-semibold text-xs text-gray-500 mb-2 uppercase">Price</h4>
                  <div className="space-y-1">
                    {priceRanges.map((range) => (
                      <button key={range.label} onClick={() => setSelectedPriceRange(range.label === selectedPriceRange ? "" : range.label)} className={cn("w-full text-left px-2 py-1.5 rounded-lg text-xs font-jost", selectedPriceRange === range.label ? "bg-primary-50 text-primary-500" : "text-gray-600")}>
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-josefin font-semibold text-gray-900 text-xl mb-2">No sarees found</h3>
              <p className="font-jost text-gray-500 mb-6">Try adjusting your filters or search terms</p>
              <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-luxury-gradient py-16 px-4 text-center">
        <h1 className="font-josefin text-4xl md:text-5xl font-light text-white mb-3">Pure Handloom Silk Sarees</h1>
        <p className="font-jost text-white/70 max-w-xl mx-auto">Handwoven with love, grace, and heritage — discover our complete collection</p>
      </div>
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10"><div className="animate-pulse grid grid-cols-2 md:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-200 rounded-2xl h-72" />)}</div></div>}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}

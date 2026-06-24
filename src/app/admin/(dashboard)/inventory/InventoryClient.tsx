"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package, AlertTriangle, XCircle, ShoppingCart,
  Search, X, Plus, Minus, ClipboardList, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adjustStock } from "@/actions/inventory";
import type { InventoryProduct, InventoryLogEntry } from "@/actions/inventory";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

type Stats = {
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  reservedStock: number;
};

type Tab = "products" | "history";
type Filter = "all" | "low" | "out";

const logTypeConfig: Record<string, { label: string; className: string }> = {
  ORDER_PLACED:   { label: "Order Placed",   className: "bg-red-100 text-red-700" },
  ORDER_CANCELLED:{ label: "Order Cancelled", className: "bg-green-100 text-green-700" },
  MANUAL_ADD:     { label: "Manual Add",      className: "bg-blue-100 text-blue-700" },
  MANUAL_REMOVE:  { label: "Manual Remove",   className: "bg-orange-100 text-orange-700" },
};

function stockLabel(p: InventoryProduct) {
  if (p.availability === "OUT_OF_STOCK" || p.stock <= 0)
    return { label: "Out of Stock", cls: "bg-red-100 text-red-700" };
  if (p.stock <= LOW_STOCK_THRESHOLD)
    return { label: "Low Stock", cls: "bg-orange-100 text-orange-700" };
  return { label: "In Stock", cls: "bg-green-100 text-green-700" };
}

export default function InventoryClient({
  stats,
  products: initialProducts,
  history: initialHistory,
}: {
  stats: Stats;
  products: InventoryProduct[];
  history: InventoryLogEntry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  // Adjust modal state
  const [adjustingProduct, setAdjustingProduct] = useState<InventoryProduct | null>(null);
  const [adjustType, setAdjustType] = useState<"ADD" | "REMOVE">("ADD");
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustError, setAdjustError] = useState("");

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === "all" ||
        (filter === "low" && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD && p.availability === "IN_STOCK") ||
        (filter === "out" && (p.stock <= 0 || p.availability === "OUT_OF_STOCK"));
      return matchSearch && matchFilter;
    });
  }, [initialProducts, search, filter]);

  function openAdjust(product: InventoryProduct) {
    setAdjustingProduct(product);
    setAdjustType("ADD");
    setAdjustQty(1);
    setAdjustReason("");
    setAdjustError("");
  }

  function closeAdjust() {
    setAdjustingProduct(null);
    setAdjustError("");
  }

  function handleAdjustSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustingProduct) return;
    setAdjustError("");

    startTransition(async () => {
      try {
        await adjustStock(adjustingProduct.id, adjustType, adjustQty, adjustReason);
        closeAdjust();
        router.refresh();
      } catch (err) {
        setAdjustError(err instanceof Error ? err.message : "Adjustment failed");
      }
    });
  }

  const statCards = [
    {
      title: "Total Stock",
      value: stats.totalStock.toLocaleString(),
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      sub: "Units across all products",
    },
    {
      title: "Low Stock",
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      color: "bg-orange-50 text-orange-600",
      sub: `≤ ${LOW_STOCK_THRESHOLD} units remaining`,
    },
    {
      title: "Out of Stock",
      value: stats.outOfStockCount.toString(),
      icon: XCircle,
      color: "bg-red-50 text-red-600",
      sub: "Products unavailable",
    },
    {
      title: "Reserved (In Carts)",
      value: stats.reservedStock.toLocaleString(),
      icon: ShoppingCart,
      color: "bg-purple-50 text-purple-600",
      sub: "Units in active carts",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="font-jost text-sm text-gray-500 mt-1">
          Track stock levels, reserve quantities, and adjust inventory.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", card.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-josefin text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
              <div className="font-jost text-sm text-gray-500">{card.title}</div>
              <div className="font-jost text-xs text-gray-400 mt-1">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {(["products", "history"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg font-jost text-sm font-medium transition-all",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "products" ? "Products" : "History"}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm font-jost focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {(["all", "low", "out"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-jost font-medium transition-all",
                    filter === f
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {f === "all" ? "All" : f === "low" ? "Low Stock" : "Out of Stock"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Product", "SKU", "Category", "Current Stock", "Reserved", "Available", "Status", "Action"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14 font-jost text-gray-400">
                        <Package className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const { label, cls } = stockLabel(product);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 rounded-lg bg-primary-50 flex-shrink-0 overflow-hidden">
                                {product.images[0] ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={40}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}
                              </div>
                              <p className="font-jost text-sm font-medium text-gray-900 line-clamp-1 max-w-40">
                                {product.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-gray-500">{product.sku}</td>
                          <td className="px-4 py-4 font-jost text-sm text-gray-500">{product.category}</td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "font-josefin font-bold text-lg",
                                product.stock <= 0
                                  ? "text-red-500"
                                  : product.stock <= LOW_STOCK_THRESHOLD
                                  ? "text-orange-500"
                                  : "text-gray-900"
                              )}
                            >
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-jost text-sm text-purple-600 font-medium">
                            {product.reservedStock}
                          </td>
                          <td className="px-4 py-4 font-jost text-sm text-gray-700 font-medium">
                            {product.availableStock}
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-jost font-medium", cls)}>
                              {label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => openAdjust(product)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 font-jost text-xs font-medium transition-colors"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-josefin font-semibold text-gray-900">Inventory History</h2>
            <p className="font-jost text-xs text-gray-400 mt-0.5">Last 100 stock change events</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Date", "Product", "Type", "Change", "Before", "After", "Reason", "Order"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {initialHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 font-jost text-gray-400">
                      <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                      No inventory events yet
                    </td>
                  </tr>
                ) : (
                  initialHistory.map((entry) => {
                    const tc = logTypeConfig[entry.type] ?? { label: entry.type, className: "bg-gray-100 text-gray-700" };
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 font-jost text-xs text-gray-500 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-jost text-sm text-gray-900 line-clamp-1 max-w-36">{entry.product.name}</p>
                          <p className="font-mono text-xs text-gray-400">{entry.product.sku}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-jost font-medium whitespace-nowrap", tc.className)}>
                            {tc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "font-josefin font-bold text-sm",
                              entry.change > 0 ? "text-green-600" : "text-red-500"
                            )}
                          >
                            {entry.change > 0 ? `+${entry.change}` : entry.change}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-jost text-sm text-gray-500">{entry.stockBefore}</td>
                        <td className="px-4 py-3.5 font-jost text-sm font-semibold text-gray-900">{entry.stockAfter}</td>
                        <td className="px-4 py-3.5 font-jost text-xs text-gray-500 max-w-48">
                          <span className="line-clamp-2">{entry.reason}</span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-gray-400">
                          {entry.order?.orderNumber ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-josefin text-lg font-semibold text-gray-900">Adjust Stock</h2>
                <p className="font-jost text-xs text-gray-400 mt-0.5 line-clamp-1">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={closeAdjust}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
              {/* Current stock info */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Current", value: adjustingProduct.stock, color: "text-gray-900" },
                  { label: "Reserved", value: adjustingProduct.reservedStock, color: "text-purple-600" },
                  { label: "Available", value: adjustingProduct.availableStock, color: "text-green-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                    <p className={cn("font-josefin font-bold text-xl", stat.color)}>{stat.value}</p>
                    <p className="font-jost text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Add / Remove toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType("ADD")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-jost font-medium text-sm transition-all border",
                    adjustType === "ADD"
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-300"
                  )}
                >
                  <Plus className="w-4 h-4" /> Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType("REMOVE")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-jost font-medium text-sm transition-all border",
                    adjustType === "REMOVE"
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                  )}
                >
                  <Minus className="w-4 h-4" /> Remove Stock
                </button>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Quantity *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-9 text-center border border-gray-200 rounded-lg font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustQty((q) => q + 1)}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Reason *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. New stock received, Damaged goods removed"
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              {adjustError && (
                <p className="text-sm font-jost text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {adjustError}
                </p>
              )}

              {/* Preview */}
              <div className="bg-gray-50 rounded-xl px-4 py-3 font-jost text-sm">
                <span className="text-gray-500">New stock will be: </span>
                <span className="font-bold text-gray-900">
                  {adjustType === "ADD"
                    ? adjustingProduct.stock + adjustQty
                    : Math.max(0, adjustingProduct.stock - adjustQty)}
                </span>
                <span className="text-gray-400 ml-1">units</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeAdjust}
                  className="flex-1 h-11 border border-gray-200 text-gray-700 font-jost font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "flex-1 h-11 font-jost font-medium rounded-xl text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-60",
                    adjustType === "ADD" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : adjustType === "ADD" ? (
                    "Add Stock"
                  ) : (
                    "Remove Stock"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, X, Loader2, Ticket, TrendingDown,
  Users, Activity, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus,
} from "@/actions/coupons";
import type { CouponRow, CouponStats, CouponFormData } from "@/actions/coupons";

type Props = { coupons: CouponRow[]; stats: CouponStats };

type FilterTab = "all" | "active" | "inactive" | "expired";

const EMPTY_FORM: CouponFormData = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: 10,
  minOrderAmt: undefined,
  maxDiscount: undefined,
  maxUses: undefined,
  perUserLimit: undefined,
  isActive: true,
  startsAt: "",
  expiresAt: "",
};

function toFormData(c: CouponRow): CouponFormData {
  return {
    code: c.code,
    description: c.description ?? "",
    type: c.type as "PERCENTAGE" | "FIXED",
    value: c.value,
    minOrderAmt: c.minOrderAmt ?? undefined,
    maxDiscount: c.maxDiscount ?? undefined,
    maxUses: c.maxUses ?? undefined,
    perUserLimit: c.perUserLimit ?? undefined,
    isActive: c.isActive,
    startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 16) : "",
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : "",
  };
}

function couponStatus(c: CouponRow): "active" | "inactive" | "expired" {
  if (!c.isActive) return "inactive";
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return "expired";
  return "active";
}

export default function AdminCouponsClient({ coupons, stats }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(c: CouponRow) {
    setEditingId(c.id);
    setForm(toFormData(c));
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setFormError("");
  }

  function setField<K extends keyof CouponFormData>(key: K, val: CouponFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleDelete(id: string, code: string) {
    if (!confirm(`Permanently delete coupon "${code}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCoupon(id);
      router.refresh();
    });
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleCouponStatus(id, !current);
      router.refresh();
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.code.trim()) { setFormError("Coupon code is required"); return; }
    if (form.value <= 0) { setFormError("Discount value must be greater than 0"); return; }
    if (form.type === "PERCENTAGE" && form.value > 100) { setFormError("Percentage cannot exceed 100"); return; }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateCoupon(editingId, form);
        } else {
          await createCoupon(form);
        }
        closeModal();
        router.refresh();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  const now = new Date();
  const filtered = coupons.filter((c) => {
    if (filter === "active") return c.isActive && (!c.expiresAt || new Date(c.expiresAt) > now);
    if (filter === "inactive") return !c.isActive;
    if (filter === "expired") return c.expiresAt && new Date(c.expiresAt) < now;
    return true;
  });

  const statCards = [
    {
      label: "Total Coupons",
      value: stats.totalCoupons,
      icon: Ticket,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Active Coupons",
      value: stats.activeCoupons,
      icon: Activity,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Uses",
      value: stats.totalUses,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Discount Given",
      value: formatPrice(stats.totalDiscountGiven),
      icon: TrendingDown,
      color: "text-orange-600 bg-orange-50",
      isPrice: true,
    },
  ];

  const tabCounts = {
    all: coupons.length,
    active: coupons.filter((c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt) > now)).length,
    inactive: coupons.filter((c) => !c.isActive).length,
    expired: coupons.filter((c) => !!c.expiresAt && new Date(c.expiresAt) < now).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-josefin text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="font-jost text-sm text-gray-500 mt-1">
            Manage discount codes and promotions
          </p>
        </div>
        <motion.button
          onClick={openCreate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-jost font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-josefin text-2xl font-bold text-gray-900">
                {card.isPrice ? card.value : card.value}
              </div>
              <div className="font-jost text-xs text-gray-500 mt-0.5">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {(["all", "active", "inactive", "expired"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-jost text-sm font-medium transition-all capitalize ${
              filter === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab} <span className="text-xs opacity-60">({tabCounts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Code", "Type / Value", "Conditions", "Uses", "Valid Period", "Status", "Actions"].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Ticket className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="font-jost text-sm text-gray-400">No coupons found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const status = couponStatus(c);
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-sm font-bold text-gray-900 tracking-widest">{c.code}</div>
                        {c.description && (
                          <div className="font-jost text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">{c.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-jost text-sm font-semibold text-gray-900">
                          {c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(c.value)}
                        </div>
                        {c.type === "PERCENTAGE" && c.maxDiscount && (
                          <div className="font-jost text-xs text-gray-400">max {formatPrice(c.maxDiscount)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          {c.minOrderAmt && (
                            <div className="font-jost text-xs text-gray-500">
                              Min: {formatPrice(c.minOrderAmt)}
                            </div>
                          )}
                          {c.perUserLimit && (
                            <div className="font-jost text-xs text-gray-500">
                              Per user: {c.perUserLimit}x
                            </div>
                          )}
                          {!c.minOrderAmt && !c.perUserLimit && (
                            <div className="font-jost text-xs text-gray-300">—</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-jost text-sm text-gray-900">
                          {c.usedCount}
                          {c.maxUses ? (
                            <span className="text-gray-400">/{c.maxUses}</span>
                          ) : null}
                        </div>
                        <div className="font-jost text-xs text-gray-400">{c._count.orders} orders</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-jost text-xs text-gray-500 space-y-0.5">
                          {c.startsAt && (
                            <div>From: {new Date(c.startsAt).toLocaleDateString("en-IN")}</div>
                          )}
                          {c.expiresAt ? (
                            <div className={new Date(c.expiresAt) < now ? "text-red-500" : ""}>
                              Until: {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                            </div>
                          ) : (
                            <div className="text-gray-300">No expiry</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-jost font-medium ${
                            status === "active"
                              ? "bg-green-100 text-green-700"
                              : status === "expired"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {status === "active" ? "Active" : status === "expired" ? "Expired" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            title={c.isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggle(c.id, c.isActive)}
                            disabled={isPending}
                            className={`p-1.5 rounded-lg transition-colors ${
                              c.isActive
                                ? "text-green-500 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            {c.isActive ? (
                              <ToggleRight className="w-4 h-4" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            disabled={isPending}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-primary-500" />
                  </div>
                  <h2 className="font-josefin text-lg font-semibold text-gray-900">
                    {editingId ? "Edit Coupon" : "Create Coupon"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-jost"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {formError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Code + Status */}
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.code}
                      onChange={(e) => setField("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
                      placeholder="MAYUR20"
                      className="w-full h-10 px-4 border border-gray-200 rounded-xl font-mono text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                  <div className="pt-7">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        onClick={() => setField("isActive", !form.isActive)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                      <span className="font-jost text-sm text-gray-600">Active</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.description ?? ""}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="e.g. New customer welcome discount"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>

                {/* Type + Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setField("type", e.target.value as "PERCENTAGE" | "FIXED")}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      {form.type === "PERCENTAGE" ? "Discount %" : "Discount ₹"} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jost text-sm text-gray-400">
                        {form.type === "PERCENTAGE" ? "%" : "₹"}
                      </span>
                      <input
                        type="number"
                        value={form.value}
                        onChange={(e) => setField("value", Number(e.target.value))}
                        min={1}
                        max={form.type === "PERCENTAGE" ? 100 : undefined}
                        className="w-full h-10 pl-8 pr-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Min Order + Max Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Min Order (₹)
                    </label>
                    <input
                      type="number"
                      value={form.minOrderAmt ?? ""}
                      onChange={(e) => setField("minOrderAmt", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="No minimum"
                      min={0}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Max Discount (₹)
                      {form.type === "FIXED" && <span className="text-gray-400 text-xs ml-1">(n/a for fixed)</span>}
                    </label>
                    <input
                      type="number"
                      value={form.maxDiscount ?? ""}
                      onChange={(e) => setField("maxDiscount", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="No cap"
                      min={0}
                      disabled={form.type === "FIXED"}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-300"
                    />
                  </div>
                </div>

                {/* Max Uses + Per User Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Total Usage Limit
                    </label>
                    <input
                      type="number"
                      value={form.maxUses ?? ""}
                      onChange={(e) => setField("maxUses", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Unlimited"
                      min={1}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Per User Limit
                    </label>
                    <input
                      type="number"
                      value={form.perUserLimit ?? ""}
                      onChange={(e) => setField("perUserLimit", e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Unlimited"
                      min={1}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Start + Expiry Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startsAt ?? ""}
                      onChange={(e) => setField("startsAt", e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt ?? ""}
                      onChange={(e) => setField("expiresAt", e.target.value)}
                      className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Preview */}
                {form.code && form.value > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <p className="font-jost text-sm text-primary-700">
                      <span className="font-bold font-mono">{form.code}</span> gives{" "}
                      {form.type === "PERCENTAGE" ? `${form.value}% off` : formatPrice(form.value)}{" "}
                      {form.maxDiscount && form.type === "PERCENTAGE" ? `(max ${formatPrice(form.maxDiscount)})` : ""}
                      {form.minOrderAmt ? ` on orders above ${formatPrice(form.minOrderAmt)}` : ""}
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 h-11 border border-gray-200 text-gray-700 font-jost font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : editingId ? (
                      "Update Coupon"
                    ) : (
                      "Create Coupon"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

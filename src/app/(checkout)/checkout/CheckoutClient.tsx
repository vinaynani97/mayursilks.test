"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Check, ShoppingBag, CreditCard, Loader2,
  ChevronRight, AlertCircle, ArrowLeft, Tag, X, CheckCircle2,
} from "lucide-react";
import { formatPrice, getCloudinaryUrl } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { validateCoupon } from "@/actions/coupons";

// Razorpay window type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void };
  }
}

interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  sku: string;
  category: string;
}
interface CartItem { id: string; productId: string; quantity: number; product: CartProduct }

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface User { id: string; name: string; email: string; phone: string }

interface Props {
  cartItems: CartItem[];
  savedAddresses: SavedAddress[];
  user: User;
}

type AppliedCoupon = {
  code: string;
  discount: number;
  type: string;
  value: number;
  maxDiscount: number | null;
  description: string | null;
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

type Step = "address" | "paying" | "verifying";

export default function CheckoutClient({ cartItems, savedAddresses, user }: Props) {
  const router = useRouter();
  const { clearCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id ?? null
  );
  const [showNewForm, setShowNewForm] = useState(savedAddresses.length === 0);
  const [newAddress, setNewAddress] = useState({
    name: user.name,
    phone: user.phone,
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<Step>("address");
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Load Razorpay checkout.js
  useEffect(() => {
    const existing = document.getElementById("rzp-script");
    if (existing) { setScriptLoaded(true); return; }
    const script = document.createElement("script");
    script.id = "rzp-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal - discount;

  function fieldChange<K extends keyof typeof newAddress>(k: K, v: string) {
    setNewAddress((prev) => ({ ...prev, [k]: v }));
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    const result = await validateCoupon(code, subtotal, user.id);
    setCouponLoading(false);
    if (result.valid) {
      setAppliedCoupon({
        code: result.code,
        discount: result.discount,
        type: result.type,
        value: result.value,
        maxDiscount: result.maxDiscount,
        description: result.description,
      });
      setCouponInput("");
    } else {
      setCouponError(result.message);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  }

  function validate(): boolean {
    setError("");
    if (!showNewForm && savedAddresses.length > 0) {
      if (!selectedAddressId) { setError("Please select a delivery address"); return false; }
    } else {
      const { name, phone, line1, city, state, pincode } = newAddress;
      if (!name || !phone || !line1 || !city || !state || !pincode) {
        setError("Please fill in all required address fields"); return false;
      }
      if (!/^\d{10}$/.test(phone)) { setError("Enter a valid 10-digit mobile number"); return false; }
      if (!/^\d{6}$/.test(pincode)) { setError("Enter a valid 6-digit pincode"); return false; }
    }
    return true;
  }

  async function handlePay() {
    if (!validate()) return;
    if (!scriptLoaded) { setError("Payment gateway is loading. Please try again."); return; }

    setStep("paying");
    setError("");

    // 1. Create Razorpay order (passes coupon code so server validates + applies discount)
    const createRes = await fetch("/api/payment/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couponCode: appliedCoupon?.code }),
    });
    const createData = await createRes.json();

    if (!createRes.ok) {
      setError(createData.error ?? "Failed to initiate payment");
      setStep("address");
      return;
    }

    // 2. Open Razorpay modal
    const rzp = new window.Razorpay({
      key: createData.key,
      amount: createData.amount,
      currency: createData.currency,
      name: "Mayur Silks",
      description: `${itemCount} item${itemCount !== 1 ? "s" : ""}`,
      image: "/logo.png",
      order_id: createData.razorpay_order_id,
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        setStep("verifying");

        const addressPayload = showNewForm || savedAddresses.length === 0
          ? { newAddress: { ...newAddress, line2: newAddress.line2 || undefined } }
          : { addressId: selectedAddressId };

        const verifyRes = await fetch("/api/payment/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            ...addressPayload,
            notes: notes || undefined,
            couponCode: appliedCoupon?.code,
          }),
        });
        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          router.push(`/checkout/failed?reason=${encodeURIComponent(verifyData.error ?? "Unknown error")}`);
          return;
        }

        await clearCart();
        router.push(`/checkout/success?orderId=${verifyData.orderId}`);
      },
      prefill: { name: user.name, email: user.email, contact: user.phone },
      theme: { color: "#9F6B4F" },
      config: {
        display: {
          sequence: ["upi", "card", "netbanking", "wallet"],
          preferences: { show_default_blocks: true },
        },
      },
      retry: { enabled: true, max_count: 1 },
      modal: {
        backdropclose: false,
        ondismiss: () => {
          setStep("address");
          setError("Payment was cancelled. Please try again.");
        },
      },
    });
    rzp.open();
  }

  const isProcessing = step === "paying" || step === "verifying";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/cart" className="flex items-center gap-1 text-sm font-jost text-gray-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-jost text-gray-900 font-medium">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Address + Notes */}
        <div className="lg:col-span-3 space-y-6">

          {/* Section: Delivery Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-500" />
              </div>
              <h2 className="font-josefin font-semibold text-gray-900">Delivery Address</h2>
            </div>

            <div className="p-6 space-y-4">
              <AnimatePresence initial={false}>
                {!showNewForm && savedAddresses.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        disabled={isProcessing}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                          selectedAddressId === addr.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-jost text-sm font-semibold text-gray-900">{addr.name}</p>
                              {addr.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-primary-100 text-primary-600 rounded font-jost">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="font-jost text-xs text-gray-500">{addr.phone}</p>
                            <p className="font-jost text-xs text-gray-500 mt-0.5">
                              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                            </p>
                            <p className="font-jost text-xs text-gray-500">
                              {addr.city}, {addr.state} — {addr.pincode}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            selectedAddressId === addr.id ? "border-primary-500 bg-primary-500" : "border-gray-300"
                          }`}>
                            {selectedAddressId === addr.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => setShowNewForm(true)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 w-full text-sm font-jost text-primary-500 hover:text-primary-700 transition-colors py-1"
                    >
                      <Plus className="w-4 h-4" /> Add a new address
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {showNewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4">
                      {savedAddresses.length > 0 && (
                        <button
                          onClick={() => setShowNewForm(false)}
                          className="text-sm font-jost text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Use saved address
                        </button>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                          <input
                            value={newAddress.name}
                            onChange={(e) => fieldChange("name", e.target.value)}
                            disabled={isProcessing}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">Mobile Number *</label>
                          <input
                            value={newAddress.phone}
                            onChange={(e) => fieldChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                            disabled={isProcessing}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50"
                            placeholder="10-digit mobile"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">Address Line 1 *</label>
                        <input
                          value={newAddress.line1}
                          onChange={(e) => fieldChange("line1", e.target.value)}
                          disabled={isProcessing}
                          className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50"
                          placeholder="House / Flat / Block No., Street"
                        />
                      </div>
                      <div>
                        <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">Address Line 2 <span className="text-gray-400">(optional)</span></label>
                        <input
                          value={newAddress.line2}
                          onChange={(e) => fieldChange("line2", e.target.value)}
                          disabled={isProcessing}
                          className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50"
                          placeholder="Landmark, Area (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">City *</label>
                          <input
                            value={newAddress.city}
                            onChange={(e) => fieldChange("city", e.target.value)}
                            disabled={isProcessing}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">State *</label>
                          <select
                            value={newAddress.state}
                            onChange={(e) => fieldChange("state", e.target.value)}
                            disabled={isProcessing}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50 bg-white"
                          >
                            <option value="">State</option>
                            {INDIAN_STATES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-jost text-xs font-medium text-gray-600 mb-1.5">Pincode *</label>
                          <input
                            value={newAddress.pincode}
                            onChange={(e) => fieldChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                            disabled={isProcessing}
                            className="w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50"
                            placeholder="6-digit PIN"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section: Order Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-josefin font-semibold text-gray-900 mb-4">Order Notes <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isProcessing}
              rows={3}
              placeholder="Any special instructions for delivery?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none disabled:bg-gray-50"
            />
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-josefin font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-jost">
                <span className="text-gray-500">Name</span>
                <span className="text-gray-900 font-medium">{user.name}</span>
              </div>
              {user.email && (
                <div className="flex justify-between text-sm font-jost">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex justify-between text-sm font-jost">
                  <span className="text-gray-500">Mobile</span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              )}
              <Link href="/account/profile" className="text-xs font-jost text-primary-500 hover:underline">
                Edit profile
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <h2 className="font-josefin font-semibold text-gray-900">Order Summary</h2>
              <span className="ml-auto text-xs font-jost text-gray-400">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 px-5 py-3.5">
                  <div className="w-14 h-16 rounded-lg overflow-hidden bg-primary-50 flex-shrink-0 relative">
                    {item.product.images[0] ? (
                      <Image
                        src={getCloudinaryUrl(item.product.images[0], 112, 128)}
                        alt={item.product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-jost text-xs text-gray-400 truncate">{item.product.category}</p>
                    <p className="font-jost text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                      {item.product.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-jost text-xs text-gray-400">Qty {item.quantity}</span>
                      <span className="font-josefin font-bold text-sm text-primary-500">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="px-5 py-4 border-t border-gray-100">
              <AnimatePresence mode="wait">
                {appliedCoupon ? (
                  <motion.div
                    key="applied"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-mono text-xs font-bold text-green-800 tracking-wider">{appliedCoupon.code}</p>
                        <p className="font-jost text-xs text-green-600">
                          {appliedCoupon.type === "PERCENTAGE"
                            ? `${appliedCoupon.value}% off · saves ${formatPrice(appliedCoupon.discount)}`
                            : `${formatPrice(appliedCoupon.discount)} flat discount`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      disabled={isProcessing}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                          disabled={isProcessing || couponLoading}
                          placeholder="Enter coupon code"
                          className="w-full h-9 pl-8 pr-3 border border-gray-200 rounded-xl font-mono text-xs font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:bg-gray-50 placeholder:font-jost placeholder:font-normal placeholder:tracking-normal"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isProcessing || couponLoading || !couponInput.trim()}
                        className="h-9 px-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-jost text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {couponError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1.5 text-xs font-jost text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {couponError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pricing Breakdown */}
            <div className="px-6 pb-4 border-t border-gray-100 space-y-2.5 pt-4">
              <div className="flex justify-between text-sm font-jost text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <AnimatePresence>
                {appliedCoupon && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between text-sm font-jost text-green-600"
                  >
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {appliedCoupon.type === "PERCENTAGE"
                        ? `${appliedCoupon.value}% Off`
                        : "Flat Discount"}{" "}
                      <span className="font-mono opacity-75">({appliedCoupon.code})</span>
                    </span>
                    <span>−{formatPrice(appliedCoupon.discount)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-between text-sm font-jost text-green-600">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-josefin font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary-500">{formatPrice(total)}</span>
              </div>
              {appliedCoupon && (
                <p className="text-center text-xs font-jost text-green-600">
                  You save {formatPrice(discount)} with this coupon!
                </p>
              )}
            </div>

            {/* Dev test card banner */}
            {process.env.NODE_ENV !== "production" && (
              <div className="mx-6 mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs font-jost text-amber-800 space-y-1">
                <p className="font-semibold text-amber-900">Test Mode — use these credentials:</p>
                <p><span className="text-amber-700">UPI (easiest):</span> <code className="bg-amber-100 px-1 rounded">success@razorpay</code></p>
                <p><span className="text-amber-700">Card (Visa domestic):</span> <code className="bg-amber-100 px-1 rounded">4208 5288 5288 5285</code> · any expiry · any CVV · OTP: <code className="bg-amber-100 px-1 rounded">1234</code></p>
                <p><span className="text-amber-700">Card (Mastercard):</span> <code className="bg-amber-100 px-1 rounded">5267 3181 8797 5449</code> · any expiry · any CVV · OTP: <code className="bg-amber-100 px-1 rounded">1234</code></p>
                <p><span className="text-amber-700">Netbanking:</span> Select any bank → proceeds automatically</p>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mx-6 mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-jost"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pay Button */}
            <div className="px-6 pb-6">
              <motion.button
                onClick={handlePay}
                disabled={isProcessing || !scriptLoaded}
                whileHover={!isProcessing ? { scale: 1.01 } : {}}
                whileTap={!isProcessing ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-jost font-semibold py-4 rounded-xl transition-colors text-sm"
              >
                {step === "paying" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating order...</>
                ) : step === "verifying" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying payment...</>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {formatPrice(total)} securely
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
              <p className="text-center text-xs font-jost text-gray-400 mt-3 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secured by Razorpay · UPI · Cards · Net Banking · Wallets
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

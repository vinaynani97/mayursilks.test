"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, User, Mail, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<"details" | "otp">("details");
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  function startResendTimer() {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function sendOtp() {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: form.mobile }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return false; }
    if (data.otp) setDevOtp(data.otp);
    startResendTimer();
    return true;
  }

  async function handleSendOtp(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await sendOtp();
    setLoading(false);
    if (ok) setStep("otp");
  }

  async function handleVerifyOtp(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("otp", {
      mobile: form.mobile,
      otp,
      name: form.name,
      email: form.email || undefined,
      mode: "register",
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid OTP. Please check and try again.");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtp("");
    setDevOtp("");
    setLoading(true);
    await sendOtp();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-josefin font-bold text-lg">M</span>
            </div>
            <span className="font-josefin font-bold text-primary-500 text-xl">MAYUR SILKS</span>
          </Link>
          <h1 className="font-josefin text-3xl font-semibold text-gray-900">Create Account</h1>
          <p className="font-jost text-gray-500 mt-2">Join us to explore premium handloom sarees</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === "details" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-jost text-sm text-gray-500">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    required
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Email (optional) */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || form.name.trim().length < 2 || form.mobile.length !== 10}
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <button
                type="button"
                onClick={() => { setStep("details"); setOtp(""); setError(""); }}
                className="flex items-center gap-1.5 font-jost text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                +91 {form.mobile}
              </button>

              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  placeholder="______"
                  className="w-full px-4 h-12 border border-gray-200 rounded-xl font-josefin text-2xl text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
                {devOtp && (
                  <p className="mt-2 font-jost text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Dev mode — OTP: <strong>{devOtp}</strong>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Verify & Create Account</>
                )}
              </button>

              <p className="text-center font-jost text-sm text-gray-500">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-primary-500 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center font-jost text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-500 hover:text-primary-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

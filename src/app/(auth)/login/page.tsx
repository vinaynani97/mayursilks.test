"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone, Lock, User2, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle, Info } from "lucide-react";

// ── Password Login ────────────────────────────────────────

function PasswordLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Invalid email/phone or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
          Email or Mobile Number
        </label>
        <div className="relative">
          <User2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder="you@example.com or 9876543210"
            className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block font-jost text-sm font-medium text-gray-700">Password</label>
          <Link href="/forgot-password" className="font-jost text-xs text-primary-500 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full pl-11 pr-11 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !identifier || !password}
        className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
        ) : "Login"}
      </button>
    </form>
  );
}

// ── OTP Login ─────────────────────────────────────────────

function OtpLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
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

  async function sendOtp(num: string) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: num }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return false; }
    if (data.otp) setDevOtp(data.otp);
    startResendTimer();
    return true;
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const ok = await sendOtp(mobile);
    if (ok) setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("otp", { mobile, otp, mode: "login", redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Invalid OTP or account not found. Please check and try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  if (step === "mobile") {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        <div>
          <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="font-jost text-sm text-gray-500">+91</span>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              required
              placeholder="9876543210"
              className="w-full pl-20 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || mobile.length !== 10}
          className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP...</>
          ) : "Send OTP"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      <button type="button" onClick={() => { setStep("mobile"); setOtp(""); setError(""); }}
        className="flex items-center gap-1.5 font-jost text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-3.5 h-3.5" /> +91 {mobile}
      </button>
      <div>
        <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Enter 6-digit OTP</label>
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
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
        ) : (
          <><CheckCircle className="w-4 h-4" /> Verify & Login</>
        )}
      </button>
      <p className="text-center font-jost text-sm text-gray-500">
        Didn&apos;t receive it?{" "}
        <button type="button" onClick={() => { setOtp(""); setDevOtp(""); sendOtp(mobile); }}
          disabled={resendCooldown > 0}
          className="text-primary-500 hover:text-primary-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed">
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
        </button>
      </p>
    </form>
  );
}

// ── Page shell ─────────────────────────────────────────────

type Tab = "password" | "otp";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered") === "1";
  const [tab, setTab] = useState<Tab>("password");

  return (
    <div className="space-y-5">
      {registered && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 font-jost text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Account created successfully! Please login.
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab("password")}
          className={`flex-1 h-9 rounded-lg font-jost text-sm font-medium transition-all ${tab === "password" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setTab("otp")}
          className={`flex-1 h-9 rounded-lg font-jost text-sm font-medium transition-all ${tab === "otp" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          OTP Login
        </button>
      </div>

      {tab === "otp" && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-3.5 py-3 font-jost text-xs">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          OTP login is for accounts registered with mobile number only.
        </div>
      )}

      {tab === "password" ? (
        <PasswordLoginForm callbackUrl={callbackUrl} />
      ) : (
        <OtpLoginForm callbackUrl={callbackUrl} />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-josefin font-bold text-lg">M</span>
            </div>
            <span className="font-josefin font-bold text-primary-500 text-xl">MAYUR SILKS</span>
          </Link>
          <h1 className="font-josefin text-3xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="font-jost text-gray-500 mt-2">Login to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-11 bg-gray-100 rounded-xl" />
              <div className="h-11 bg-gray-100 rounded-xl" />
            </div>
          }>
            <LoginContent />
          </Suspense>
        </div>

        <p className="text-center font-jost text-sm text-gray-500 mt-6">
          New to Mayur Silks?{" "}
          <Link href="/register" className="text-primary-500 hover:text-primary-700 font-medium">
            Create account
          </Link>
        </p>

        <p className="text-center font-jost text-xs text-gray-400 mt-3">
          Are you an admin?{" "}
          <Link href="/admin/login" className="text-gray-500 hover:text-gray-700">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}

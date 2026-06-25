"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, Shield,
} from "lucide-react";
import { registerUser } from "@/actions/auth";

// ─── Password Strength ────────────────────────────────────────

function passwordStrength(pw: string): { label: string; color: string; score: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-red-400", score };
  if (score === 3) return { label: "Fair", color: "bg-amber-400", score };
  if (score === 4) return { label: "Good", color: "bg-blue-400", score };
  return { label: "Strong", color: "bg-green-500", score };
}

// ─── Component ────────────────────────────────────────────────

type Step = "form" | "verify";

export default function RegisterPage() {
  const router = useRouter();

  // ── Form state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── OTP / step state
  const [step, setStep] = useState<Step>("form");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // ── Shared UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const strength = passwordStrength(form.password);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // ── Helpers

  function set(field: keyof typeof form) {
    return (e: { target: { value: string } }) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function startCountdown() {
    setCountdown(30);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  function validateForm(): string | null {
    if (form.name.trim().length < 2) return "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) return "Please enter a valid 10-digit Indian mobile number.";
    if (form.password !== form.confirm) return "Passwords do not match.";
    if (strength.score < 3) return "Password is too weak. Add uppercase, lowercase, and numbers.";
    return null;
  }

  // ── Step 1: Send OTP

  async function handleSendOtp(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
        }),
      });

      const data = await res.json() as { error?: string; devOtp?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to send verification code. Please try again.");
        return;
      }

      if (data.devOtp) setDevOtp(data.devOtp);
      setStep("verify");
      startCountdown();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Resend OTP

  async function handleResend() {
    if (countdown > 0 || loading) return;
    setError("");
    setOtp("");
    setDevOtp(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
        }),
      });

      const data = await res.json() as { error?: string; devOtp?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to resend code. Please try again.");
        return;
      }

      if (data.devOtp) setDevOtp(data.devOtp);
      startCountdown();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP → Register → Sign in

  async function handleVerify(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), otp }),
      });

      const verifyData = await verifyRes.json() as { error?: string };

      if (!verifyRes.ok) {
        setError(verifyData.error ?? "Verification failed. Please try again.");
        return;
      }

      // 2. Register user (only after OTP verified)
      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
      });

      if (!result.success) {
        setError(result.message ?? "Registration failed. Please try again.");
        return;
      }

      // 3. Auto sign in
      const signInResult = await signIn("credentials", {
        identifier: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?registered=1");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
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

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* ── STEP 1: Registration form ── */}
          {step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    required
                    minLength={2}
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-jost text-sm text-gray-500">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    required
                    placeholder="9876543210"
                    className="w-full pl-20 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full pl-11 pr-11 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength.score ? strength.color : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`font-jost text-xs ${
                        strength.score <= 2
                          ? "text-red-500"
                          : strength.score === 3
                          ? "text-amber-500"
                          : strength.score === 4
                          ? "text-blue-500"
                          : "text-green-600"
                      }`}
                    >
                      {strength.label} — use uppercase, lowercase, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={set("confirm")}
                    required
                    placeholder="Re-enter password"
                    className={`w-full pl-11 pr-11 h-11 border rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
                      form.confirm && form.confirm !== form.password
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-primary-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {form.confirm && form.confirm === form.password && (
                    <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="mt-1 font-jost text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || form.phone.length !== 10 || form.name.trim().length < 2}
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: Email OTP verification ── */}
          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">

              {/* Sent banner */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 font-jost text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Verification code sent to{" "}
                  <strong className="font-semibold">{form.email}</strong>. Check your inbox.
                </span>
              </div>

              {/* Dev-mode OTP helper — stripped at production build time */}
              {devOtp && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 font-jost text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-amber-600">
                    Dev OTP:
                  </span>
                  <span className="font-mono font-bold text-lg tracking-widest">{devOtp}</span>
                </div>
              )}

              {/* OTP input */}
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Verification Code
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      setOtp(pasted);
                    }}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>
                <p className="mt-1.5 font-jost text-xs text-gray-400">
                  Code expires in 10 minutes
                </p>
              </div>

              {/* Verify button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Create Account"
                )}
              </button>

              {/* Resend + back */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || countdown > 0}
                  className="font-jost text-sm text-primary-500 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Resend code
                </button>
                {countdown > 0 ? (
                  <span className="font-jost text-sm text-gray-400">
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep("form"); setError(""); setOtp(""); setDevOtp(null); }}
                    className="font-jost text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Change email
                  </button>
                )}
              </div>
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

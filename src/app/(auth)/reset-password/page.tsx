"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = passwordStrength(password);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-jost text-gray-700">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="font-jost text-sm text-primary-500 hover:text-primary-700 font-medium">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-5">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <p className="font-jost text-gray-700 font-medium">Password reset successfully!</p>
          <p className="font-jost text-sm text-gray-500 mt-1">You can now log in with your new password.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-jost font-semibold rounded-xl transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (strength.score < 3) {
      setError("Password is too weak. Add uppercase, lowercase, and numbers.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to reset password. The link may have expired.");
      return;
    }

    setDone(true);
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm mb-5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          {error.includes("expired") && (
            <Link href="/forgot-password" className="ml-auto text-primary-500 hover:underline whitespace-nowrap">
              New link
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full pl-11 pr-11 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                ))}
              </div>
              <p className={`font-jost text-xs ${strength.score <= 2 ? "text-red-500" : strength.score === 3 ? "text-amber-500" : strength.score === 4 ? "text-blue-500" : "text-green-600"}`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Re-enter new password"
              className={`w-full pl-11 pr-11 h-11 border rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
                confirm && confirm !== password ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary-500"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {confirm && confirm === password && (
              <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
          </div>
          {confirm && confirm !== password && (
            <p className="mt-1 font-jost text-xs text-red-500">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
          ) : "Reset Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="font-josefin text-3xl font-semibold text-gray-900">Reset Password</h1>
          <p className="font-jost text-gray-500 mt-2">Choose a new secure password</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-11 bg-gray-100 rounded-xl" />
              <div className="h-11 bg-gray-100 rounded-xl" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

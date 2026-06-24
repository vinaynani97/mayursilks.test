"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

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
          <h1 className="font-josefin text-3xl font-semibold text-gray-900">Forgot Password</h1>
          <p className="font-jost text-gray-500 mt-2">
            {sent ? "Check your inbox" : "We'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="font-jost text-gray-700 font-medium">Reset link sent!</p>
                <p className="font-jost text-sm text-gray-500 mt-1">
                  If <strong>{email}</strong> is registered, you&apos;ll receive a password reset link within a few minutes.
                </p>
              </div>
              <p className="font-jost text-xs text-gray-400">
                Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-jost text-sm text-primary-500 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-jost text-sm mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <p className="text-center font-jost text-sm text-gray-500 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary-500 hover:text-primary-700 font-medium">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

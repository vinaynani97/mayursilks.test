"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { registerUser } from "@/actions/auth";

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

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = passwordStrength(form.password);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (strength.score < 3) {
      setError("Password is too weak. Add uppercase, lowercase, and numbers.");
      return;
    }

    setLoading(true);
    const result = await registerUser({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      password: form.password,
    });

    if (!result.success) {
      setError(result.message ?? "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    const signInResult = await signIn("credentials", {
      identifier: form.email.trim().toLowerCase(),
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (signInResult?.error) {
      // Registration succeeded but auto sign-in failed — redirect to login
      router.push("/login?registered=1");
      return;
    }

    router.push("/account");
    router.refresh();
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
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
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`font-jost text-xs ${strength.score <= 2 ? "text-red-500" : strength.score === 3 ? "text-amber-500" : strength.score === 4 ? "text-blue-500" : "text-green-600"}`}>
                    {strength.label} — use uppercase, lowercase, numbers & symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  required
                  placeholder="Re-enter password"
                  className={`w-full pl-11 pr-11 h-11 border rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors ${
                    form.confirm && form.confirm !== form.password ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary-500"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
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

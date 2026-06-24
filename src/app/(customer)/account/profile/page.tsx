"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Phone, Mail, Save, CheckCircle } from "lucide-react";

export default function AccountProfilePage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setForm({ name: session.user.name ?? "", email: session.user.email ?? "" });
    }
  }, [session]);

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email || undefined }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save");
      return;
    }
    await update({ name: form.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!session) return null;

  return (
    <div>
      <h1 className="font-josefin text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="font-josefin font-bold text-primary-500 text-2xl">
              {session.user.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-josefin font-semibold text-gray-900 text-lg">{session.user.name}</p>
            <p className="font-jost text-sm text-gray-400">CUSTOMER</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-jost text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full pl-11 pr-4 h-11 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
          </div>

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

          <div>
            <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                disabled
                placeholder="Linked via OTP"
                className="w-full pl-11 pr-4 h-11 border border-gray-100 rounded-xl font-jost text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 font-jost text-xs text-gray-400">Mobile number is used for login and cannot be changed here.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-medium rounded-xl transition-all"
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> Saved!</>
            ) : loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

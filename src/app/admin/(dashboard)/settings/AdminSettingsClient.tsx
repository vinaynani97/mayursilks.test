"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Mail } from "lucide-react";

const EMAIL_SETTINGS_FIELDS = [
  { key: "email_from_name", label: "Sender Name", placeholder: "Mayur Silks" },
  { key: "email_from_address", label: "Sender Email Address", placeholder: "noreply@mayursilks.com" },
  { key: "email_admin_email", label: "Admin Notification Email", placeholder: "admin@mayursilks.com" },
  { key: "low_stock_threshold", label: "Low Stock Alert Threshold", placeholder: "5" },
];

const SETTINGS_FIELDS = [
  { key: "site_name", label: "Site Name", placeholder: "Mayur Silks" },
  {
    key: "site_tagline",
    label: "Tagline",
    placeholder: "Pure Handloom Silk Sarees",
  },
  {
    key: "email",
    label: "Contact Email",
    placeholder: "contact@mayursilks.com",
  },
  { key: "phone", label: "Contact Phone", placeholder: "+91 96528 03383" },
  {
    key: "whatsapp_number",
    label: "WhatsApp Number",
    placeholder: "919652803383",
  },
  {
    key: "address",
    label: "Business Address",
    placeholder: "Jangaon, Telangana, India",
  },
  {
    key: "free_shipping_above",
    label: "Free Shipping Above (₹)",
    placeholder: "999",
  },
  {
    key: "instagram",
    label: "Instagram URL",
    placeholder: "https://instagram.com/...",
  },
  {
    key: "facebook",
    label: "Facebook URL",
    placeholder: "https://facebook.com/...",
  },
];

export default function AdminSettingsClient({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const allKeys = [
        ...SETTINGS_FIELDS.map((f) => f.key),
        ...EMAIL_SETTINGS_FIELDS.map((f) => f.key),
        "email_notifications_enabled",
      ];
      const updates = allKeys.map((key) => ({
        key,
        value: key === "email_notifications_enabled"
          ? (fd.get(key) ? "true" : "false")
          : ((fd.get(key) as string) || ""),
      }));

      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="font-jost text-sm text-gray-500 mt-1">
          Manage your store configuration
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-josefin font-semibold text-gray-900 text-lg border-b border-gray-100 pb-3">
              Store Information
            </h2>
            {SETTINGS_FIELDS.slice(0, 6).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  {label}
                </label>
                <input
                  name={key}
                  defaultValue={settings[key] ?? ""}
                  placeholder={placeholder}
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="font-josefin font-semibold text-gray-900 text-lg border-b border-gray-100 pb-3">
              Social & Shipping
            </h2>
            {SETTINGS_FIELDS.slice(6).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  {label}
                </label>
                <input
                  name={key}
                  defaultValue={settings[key] ?? ""}
                  placeholder={placeholder}
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="font-jost text-xs text-amber-700">
                <strong>Note:</strong> Some settings require a page refresh to
                take effect on the storefront.
              </p>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
            <Mail className="w-4 h-4 text-primary-500" />
            <h2 className="font-josefin font-semibold text-gray-900 text-lg">Email Notifications</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Toggle */}
            <div className="lg:col-span-2 flex items-center justify-between p-4 bg-primary-50 rounded-xl border border-primary-100">
              <div>
                <p className="font-jost text-sm font-semibold text-gray-900">Enable Email Notifications</p>
                <p className="font-jost text-xs text-gray-500 mt-0.5">Send transactional emails to customers and admins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="email_notifications_enabled"
                  defaultChecked={settings["email_notifications_enabled"] !== "false"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            {EMAIL_SETTINGS_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  name={key}
                  defaultValue={settings[key] ?? ""}
                  placeholder={placeholder}
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="font-jost text-xs text-blue-700">
              <strong>Note:</strong> Set <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> in your environment variables to enable sending. Sender name/address here will override the environment defaults.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-jost font-medium text-sm transition-all"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isPending ? "Saving..." : "Save Settings"}
          </button>
          {saved && (
            <span className="font-jost text-sm text-green-600 font-medium">
              ✓ Settings saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

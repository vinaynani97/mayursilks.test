"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell, CheckCheck, Trash2, Check, RefreshCw, Search,
  ShoppingBag, Package, CreditCard, AlertTriangle,
  Users, Tag, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/hooks/useNotifications";

// ─── Type → category mapping for filter chips ────────────────────────────────

type FilterCategory = "all" | "orders" | "payments" | "inventory" | "customers" | "marketing";

const typeToCategory: Record<string, FilterCategory> = {
  ADMIN_NEW_ORDER:         "orders",
  ADMIN_ORDER_CANCELLED:   "orders",
  ADMIN_REFUND_REQUESTED:  "orders",
  ADMIN_PAYMENT_SUCCESS:   "payments",
  ADMIN_PAYMENT_FAILED:    "payments",
  ADMIN_LOW_STOCK:         "inventory",
  ADMIN_OUT_OF_STOCK:      "inventory",
  ADMIN_INVENTORY_UPDATED: "inventory",
  ADMIN_NEW_CUSTOMER:      "customers",
  ADMIN_NEW_REVIEW:        "customers",
  ADMIN_COUPON_USED:       "marketing",
  ADMIN_CONTACT_FORM:      "marketing",
  ADMIN_NEWSLETTER:        "marketing",
};

const categoryIcons: Record<FilterCategory, React.ElementType> = {
  all:        Bell,
  orders:     ShoppingBag,
  payments:   CreditCard,
  inventory:  Package,
  customers:  Users,
  marketing:  Tag,
};

const priorityColor: Record<string, string> = {
  URGENT: "bg-red-100    text-red-600",
  HIGH:   "bg-orange-100 text-orange-600",
  NORMAL: "bg-gray-100   text-gray-500",
  LOW:    "bg-gray-50    text-gray-400",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (diff  < 60_000)  return "just now";
  if (mins  < 60)      return `${mins}m ago`;
  if (hours < 24)      return `${hours}h ago`;
  if (days  === 1)     return "yesterday";
  if (days  < 7)       return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ─── Client component ─────────────────────────────────────────────────────────

export default function AdminNotificationsClient() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [hasMore,       setHasMore]       = useState(false);
  const [nextCursor,    setNextCursor]    = useState<string | null>(null);
  const [filter,        setFilter]        = useState<"all" | "unread">("all");
  const [category,      setCategory]      = useState<FilterCategory>("all");
  const [search,        setSearch]        = useState("");
  const [unreadCount,   setUnreadCount]   = useState(0);

  const fetchNotifications = useCallback(async (opts?: {
    replace?: boolean;
    cursor?:  string;
  }) => {
    const { replace = true, cursor } = opts ?? {};
    if (replace) setIsLoading(true);

    const params = new URLSearchParams({
      limit:      "20",
      unreadOnly: String(filter === "unread"),
    });
    if (cursor) params.set("cursor", cursor);

    try {
      const res  = await fetch(`/api/notifications?${params}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        nextCursor:    string | null;
        hasMore:       boolean;
      };

      if (replace) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } finally {
      if (replace) setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchNotifications({ replace: true });
  }, [filter, fetchNotifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  };

  const deleteOne = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
  };

  const clearRead = async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    await fetch("/api/notifications/clear-read", { method: "DELETE" });
  };

  // Client-side search + category filter
  const visible = notifications.filter((n) => {
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      category === "all" || typeToCategory[n.type] === category;

    return matchSearch && matchCategory;
  });

  const categories: FilterCategory[] = ["all", "orders", "payments", "inventory", "customers", "marketing"];

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-josefin text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="font-jost text-sm text-gray-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllRead()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-jost font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={() => void clearRead()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-jost font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear read
          </button>
          <button
            onClick={() => void fetchNotifications({ replace: true })}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-jost focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat];
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-jost font-medium transition-all capitalize",
                  category === cat
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Read filter */}
        <div className="flex gap-1">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-jost font-medium transition-all",
                filter === f
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-5 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <p className="font-josefin text-base font-bold text-gray-400">
              No notifications
            </p>
            <p className="font-jost text-sm text-gray-400 mt-1">
              {search ? "No results for your search" : "Nothing here yet"}
            </p>
          </div>
        )}

        {!isLoading && visible.length > 0 && (
          <div className="divide-y divide-gray-50">
            {visible.map((n) => {
              const row = (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group cursor-pointer",
                    !n.isRead && "bg-orange-50/20"
                  )}
                  onClick={() => { if (!n.isRead) void markRead(n.id); }}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-lg shadow-sm">
                    {n.icon ?? "🔔"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn(
                        "font-jost text-sm text-gray-800",
                        !n.isRead && "font-semibold"
                      )}>
                        {n.title}
                      </p>
                      {n.priority !== "NORMAL" && (
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide",
                          priorityColor[n.priority] ?? priorityColor.NORMAL
                        )}>
                          {n.priority}
                        </span>
                      )}
                    </div>
                    <p className="font-jost text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="font-jost text-xs text-gray-400 mt-1.5">
                      {relativeTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); void markRead(n.id); }}
                        className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-100 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); void deleteOne(n.id); }}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link} className="block">
                  {row}
                </Link>
              ) : (
                <div key={n.id}>{row}</div>
              );
            })}
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="border-t border-gray-100 px-5 py-4 text-center">
            <button
              onClick={async () => {
                if (!nextCursor) return;
                await fetchNotifications({ replace: false, cursor: nextCursor });
              }}
              className="font-jost text-sm text-primary-500 hover:text-primary-700 transition-colors"
            >
              Load older notifications
            </button>
          </div>
        )}
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",  value: notifications.length, icon: Bell,          color: "text-gray-600" },
          { label: "Unread", value: unreadCount,           icon: AlertTriangle, color: "text-orange-500" },
          { label: "Read",   value: notifications.length - unreadCount, icon: Check, color: "text-green-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={cn("p-2 rounded-xl bg-gray-50", color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-josefin text-xl font-bold text-gray-900">{value}</p>
              <p className="font-jost text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

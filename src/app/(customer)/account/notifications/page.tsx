"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2, Check, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/hooks/useNotifications";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

type DateGroup = "Today" | "Yesterday" | "Older";

function dateGroup(iso: string): DateGroup {
  const d     = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1);
  if (d >= today) return "Today";
  if (d >= yest)  return "Yesterday";
  return "Older";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [hasMore,       setHasMore]       = useState(false);
  const [nextCursor,    setNextCursor]    = useState<string | null>(null);
  const [filter,        setFilter]        = useState<"all" | "unread">("all");
  const [unreadCount,   setUnreadCount]   = useState(0);

  const fetchNotifications = useCallback(async (opts?: { replace?: boolean; cursor?: string; unreadOnly?: boolean }) => {
    const { replace = true, cursor, unreadOnly = filter === "unread" } = opts ?? {};
    if (replace) setIsLoading(true);

    const params = new URLSearchParams({ limit: "15", unreadOnly: String(unreadOnly) });
    if (cursor) params.set("cursor", cursor);

    try {
      const res  = await fetch(`/api/notifications?${params}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        nextCursor: string | null;
        hasMore: boolean;
      };

      if (replace) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
    } finally {
      if (replace) setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void fetchNotifications({ replace: true, unreadOnly: filter === "unread" });
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

  const loadMore = async () => {
    if (!hasMore || !nextCursor) return;
    await fetchNotifications({ replace: false, cursor: nextCursor });
  };

  // Group by date
  const groups: Partial<Record<DateGroup, NotificationItem[]>> = {};
  for (const n of notifications) {
    const g = dateGroup(n.createdAt);
    (groups[g] ??= []).push(n);
  }
  const orderedGroups: DateGroup[] = ["Today", "Yesterday", "Older"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-josefin text-xl font-bold text-gray-900">Notifications</h1>
          <p className="font-jost text-sm text-gray-500 mt-0.5">
            Stay updated on your orders, offers and account activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchNotifications({ replace: true })}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters + actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          {/* Filter tabs */}
          <div className="flex gap-1">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-jost font-medium transition-all",
                  filter === f
                    ? "bg-primary-500 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {f === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-jost font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => void clearRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-jost font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear read
            </button>
          </div>
        </div>

        {/* List */}
        <div>
          {isLoading && (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Bell className="w-12 h-12 text-gray-200 mb-4" />
              <p className="font-josefin text-base font-bold text-gray-400">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="font-jost text-sm text-gray-400 mt-1">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "Order updates, deals and account activity will appear here"}
              </p>
              {filter === "unread" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-4 flex items-center gap-1.5 text-sm font-jost text-primary-500 hover:underline"
                >
                  <Filter className="w-3.5 h-3.5" />
                  View all notifications
                </button>
              )}
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <div className="divide-y divide-gray-50">
              {orderedGroups.map((group) => {
                const items = groups[group];
                if (!items?.length) return null;
                return (
                  <div key={group}>
                    <p className="px-4 pt-4 pb-2 font-josefin text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {group}
                    </p>
                    {items.map((n) => {
                      const row = (
                        <div
                          key={n.id}
                          className={cn(
                            "flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors group cursor-pointer",
                            !n.isRead && "bg-primary-50/30"
                          )}
                          onClick={() => { if (!n.isRead) void markRead(n.id); }}
                        >
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-lg shadow-sm">
                            {n.icon ?? "🔔"}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-jost text-sm text-gray-800",
                              !n.isRead && "font-semibold"
                            )}>
                              {n.title}
                            </p>
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
                        row
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="border-t border-gray-100 px-4 py-4 text-center">
            <button
              onClick={() => void loadMore()}
              className="font-jost text-sm text-primary-500 hover:text-primary-700 transition-colors"
            >
              Load older notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

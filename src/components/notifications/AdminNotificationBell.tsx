"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCheck, Trash2, Check, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type NotificationItem } from "@/hooks/useNotifications";

// ─── Priority badge ───────────────────────────────────────────────────────────

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
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Single notification row ──────────────────────────────────────────────────

function AdminNotifRow({
  n,
  onRead,
  onDelete,
}: {
  n: NotificationItem;
  onRead:   (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const inner = (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group",
        !n.isRead && "bg-orange-50/30"
      )}
      onClick={() => { if (!n.isRead) void onRead(n.id); }}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 text-base shadow-sm">
        {n.icon ?? "🔔"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn(
            "font-jost text-sm text-gray-800 leading-snug",
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
        <p className="font-jost text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
          {n.message}
        </p>
        <p className="font-jost text-[10px] text-gray-400 mt-1">
          {relativeTime(n.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!n.isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); void onRead(n.id); }}
            className="p-1 rounded text-primary-500 hover:bg-primary-100 transition-colors"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); void onDelete(n.id); }}
          className="p-1 rounded text-red-400 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {!n.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
      )}
    </div>
  );

  if (n.link) {
    return (
      <Link href={n.link} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminNotificationBell() {
  const {
    notifications,
    unreadCount,
    isOpen,
    isLoading,
    hasMore,
    setIsOpen,
    markRead,
    markAllRead,
    deleteOne,
    clearRead,
    loadMore,
  } = useNotifications({ pollInterval: 15_000, dropdownLimit: 10 });

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-500" />
                <span className="font-josefin font-bold text-sm text-gray-900">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/admin/notifications"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  title="View all"
                >
                  <Filter className="w-4 h-4" />
                </Link>
                {unreadCount > 0 && (
                  <button
                    onClick={() => void markAllRead()}
                    className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => void clearRead()}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  title="Clear read"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[460px] overflow-y-auto">
              {isLoading && notifications.length === 0 && (
                <div className="space-y-0 divide-y divide-gray-50">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                        <div className="h-2.5 bg-gray-100 rounded w-full" />
                        <div className="h-2 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="font-jost text-sm font-medium text-gray-500">
                    No admin notifications
                  </p>
                  <p className="font-jost text-xs text-gray-400 mt-1">
                    Order alerts, stock warnings and more will appear here
                  </p>
                </div>
              )}

              {notifications.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <AdminNotifRow
                      key={n.id}
                      n={n}
                      onRead={markRead}
                      onDelete={deleteOne}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="px-4 py-2 border-t border-gray-50">
                  <button
                    onClick={() => void loadMore()}
                    disabled={isLoading}
                    className="w-full py-2 text-xs font-jost text-primary-500 hover:text-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center font-jost text-xs font-semibold text-primary-500 hover:text-primary-700 transition-colors"
              >
                View all notifications & filters →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

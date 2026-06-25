"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface NotificationItem {
  id:        string;
  title:     string;
  message:   string;
  type:      string;
  priority:  string;
  icon:      string | null;
  link:      string | null;
  metadata:  Record<string, unknown> | null;
  isRead:    boolean;
  emailSent: boolean;
  createdAt: string;
}

interface UseNotificationsOptions {
  pollInterval?: number; // ms — default 30 000
  dropdownLimit?: number;
}

interface UseNotificationsReturn {
  notifications:    NotificationItem[];
  unreadCount:      number;
  isOpen:           boolean;
  isLoading:        boolean;
  hasMore:          boolean;
  setIsOpen:        (open: boolean) => void;
  markRead:         (id: string) => Promise<void>;
  markAllRead:      () => Promise<void>;
  deleteOne:        (id: string) => Promise<void>;
  clearRead:        () => Promise<void>;
  loadMore:         () => Promise<void>;
  refresh:          () => void;
}

export function useNotifications(
  opts: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const { pollInterval = 30_000, dropdownLimit = 8 } = opts;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isOpen,        setIsOpenState]   = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [nextCursor,    setNextCursor]    = useState<string | null>(null);

  const fetchedRef = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch unread count (lightweight polling) ──────────────────────────────
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { count: number };
        setUnreadCount(data.count);
      }
    } catch {
      // swallow — badge just won't update on this tick
    }
  }, []);

  // ── Fetch notification list (on dropdown open) ────────────────────────────
  const fetchNotifications = useCallback(async (replace = true) => {
    setIsLoading(true);
    try {
      const url = `/api/notifications?limit=${dropdownLimit}`;
      const res = await fetch(url, { cache: "no-store" });
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
      // Update badge from live data
      setUnreadCount(data.notifications.filter((n) => !n.isRead).length + (replace ? 0 : unreadCount));
    } catch {
      // swallow
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownLimit]);

  // ── Open/close dropdown ───────────────────────────────────────────────────
  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    if (open && !fetchedRef.current) {
      fetchedRef.current = true;
      void fetchNotifications(true);
    }
    if (open) {
      void fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Load more (pagination) ────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/notifications?limit=${dropdownLimit}&cursor=${encodeURIComponent(nextCursor)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        nextCursor: string | null;
        hasMore: boolean;
      };
      setNotifications((prev) => [...prev, ...data.notifications]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      // swallow
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, nextCursor, dropdownLimit]);

  // ── Mark single read (optimistic) ─────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      // revert on error
      void fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Mark all read (optimistic) ────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
    } catch {
      void fetchNotifications(true);
      void fetchCount();
    }
  }, [fetchNotifications, fetchCount]);

  // ── Delete single (optimistic) ────────────────────────────────────────────
  const deleteOne = useCallback(async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.isRead) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch {
      void fetchNotifications(true);
    }
  }, [notifications, fetchNotifications]);

  // ── Clear all read ────────────────────────────────────────────────────────
  const clearRead = useCallback(async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    try {
      await fetch("/api/notifications/clear-read", { method: "DELETE" });
    } catch {
      void fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Manual refresh ────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    void fetchCount();
    if (isOpen) void fetchNotifications(true);
  }, [fetchCount, fetchNotifications, isOpen]);

  // ── Initial count + polling ───────────────────────────────────────────────
  useEffect(() => {
    void fetchCount();
    timerRef.current = setInterval(fetchCount, pollInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchCount, pollInterval]);

  return {
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
    refresh,
  };
}

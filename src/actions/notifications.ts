"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Mark single notification read ────────────────────────────────────────────

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "ADMIN";

  const existing = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true, role: true },
  });

  if (!existing) return { success: false };

  const owns = isAdmin
    ? existing.role === "ADMIN"
    : existing.userId === session.user.id;

  if (!owns) throw new Error("Forbidden");

  await prisma.notification.update({ where: { id }, data: { isRead: true } });

  revalidatePath("/account/notifications");
  revalidatePath("/admin/notifications");
  return { success: true };
}

// ─── Mark all notifications read ─────────────────────────────────────────────

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "ADMIN";

  await prisma.notification.updateMany({
    where: isAdmin
      ? { role: "ADMIN", isRead: false }
      : { userId: session.user.id, role: "CUSTOMER", isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/account/notifications");
  revalidatePath("/admin/notifications");
  return { success: true };
}

// ─── Delete single notification ───────────────────────────────────────────────

export async function deleteNotification(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "ADMIN";

  const existing = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true, role: true },
  });

  if (!existing) return { success: false };

  const owns = isAdmin
    ? existing.role === "ADMIN"
    : existing.userId === session.user.id;

  if (!owns) throw new Error("Forbidden");

  await prisma.notification.delete({ where: { id } });

  revalidatePath("/account/notifications");
  revalidatePath("/admin/notifications");
  return { success: true };
}

// ─── Clear all read notifications ────────────────────────────────────────────

export async function clearReadNotifications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isAdmin = session.user.role === "ADMIN";

  await prisma.notification.deleteMany({
    where: isAdmin
      ? { role: "ADMIN", isRead: true }
      : { userId: session.user.id, role: "CUSTOMER", isRead: true },
  });

  revalidatePath("/account/notifications");
  revalidatePath("/admin/notifications");
  return { success: true };
}

// ─── Get unread count (server-side, for initial SSR) ─────────────────────────

export async function getUnreadCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const isAdmin = session.user.role === "ADMIN";

  return prisma.notification.count({
    where: isAdmin
      ? { role: "ADMIN", isRead: false }
      : { userId: session.user.id, role: "CUSTOMER", isRead: false },
  });
}

// ─── Get paginated notifications (server-side, for full page) ─────────────────

export async function getNotifications(options?: {
  cursor?: string;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { notifications: [], nextCursor: null, hasMore: false };

  const limit      = Math.min(options?.limit ?? 15, 30);
  const unreadOnly = options?.unreadOnly ?? false;
  const isAdmin    = session.user.role === "ADMIN";

  const where = isAdmin
    ? { role: "ADMIN"    as const, ...(unreadOnly && { isRead: false }) }
    : { role: "CUSTOMER" as const, userId: session.user.id, ...(unreadOnly && { isRead: false }) };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...(options?.cursor && { cursor: { id: options.cursor }, skip: 1 }),
    take: limit + 1,
    select: {
      id:        true,
      title:     true,
      message:   true,
      type:      true,
      priority:  true,
      icon:      true,
      link:      true,
      metadata:  true,
      isRead:    true,
      emailSent: true,
      createdAt: true,
    },
  });

  const hasMore    = notifications.length > limit;
  const items      = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

  return { notifications: items, nextCursor, hasMore };
}

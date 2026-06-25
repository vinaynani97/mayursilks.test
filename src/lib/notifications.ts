import { prisma } from "@/lib/db";
import type { NotificationType, NotificationPriority, Role } from "@prisma/client";

// ─── Input contract ────────────────────────────────────────────────────────────

export interface NotificationInput {
  userId?: string | null;
  role?: Role;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  icon?: string | null;
  link?: string | null;
  metadata?: Record<string, unknown>;
  emailSent?: boolean;
}

// ─── Future channel interfaces (wire up when ready) ───────────────────────────
// interface WhatsAppChannel { send(to: string, message: string): Promise<void> }
// interface SmsChannel     { send(to: string, message: string): Promise<void> }
// interface PushChannel    { send(userId: string, title: string, body: string): Promise<void> }

// ─── Core service ─────────────────────────────────────────────────────────────

/**
 * Single entry point for every notification event.
 * Handles in-app delivery now; email/WhatsApp/SMS/push slots are reserved.
 * Never throws — failures are logged and swallowed so the main flow is never
 * interrupted by a notification error.
 */
export async function createNotification(input: NotificationInput): Promise<void> {
  try {
    const role: Role = input.role ?? (input.userId ? "CUSTOMER" : "ADMIN");

    await prisma.notification.create({
      data: {
        userId:    input.userId   ?? null,
        role,
        type:      input.type,
        title:     input.title,
        message:   input.message,
        priority:  input.priority ?? "NORMAL",
        icon:      input.icon     ?? null,
        link:      input.link     ?? null,
        metadata:  input.metadata as object | undefined,
        emailSent: input.emailSent ?? false,
      },
    });
  } catch (err) {
    console.error("[NotificationService] createNotification failed:", err);
  }
}

/**
 * Convenience wrapper for role-level admin notifications (no specific userId).
 */
export async function createAdminNotification(
  input: Omit<NotificationInput, "role" | "userId">
): Promise<void> {
  return createNotification({ ...input, role: "ADMIN", userId: null });
}

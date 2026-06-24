"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { EmailType, EmailStatus } from "@prisma/client";
import {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendWelcomeEmail,
  sendOrderStatusEmail,
  sendRefundProcessedEmail,
} from "@/lib/email";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export type EmailLogRow = {
  id: string;
  email: string;
  subject: string;
  type: EmailType;
  status: EmailStatus;
  provider: string;
  errorMessage: string | null;
  referenceId: string | null;
  sentAt: Date | null;
  createdAt: Date;
  user: { name: string; email: string | null } | null;
};

export type EmailStats = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  today: number;
  successRate: number;
  mostSentType: EmailType | null;
};

export async function getEmailLogs(options?: {
  type?: EmailType;
  status?: EmailStatus;
  search?: string;
  limit?: number;
}): Promise<EmailLogRow[]> {
  const session = await auth();
  requireAdmin(session);

  try {
    return await prisma.emailLog.findMany({
      where: {
        ...(options?.type && { type: options.type }),
        ...(options?.status && { status: options.status }),
        ...(options?.search && {
          OR: [
            { email: { contains: options.search, mode: "insensitive" } },
            { subject: { contains: options.search, mode: "insensitive" } },
          ],
        }),
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 100,
    });
  } catch {
    return [];
  }
}

export async function getEmailStats(): Promise<EmailStats> {
  const session = await auth();
  requireAdmin(session);

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [total, sent, failed, pending, today_count, typeGroups] = await Promise.all([
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: "SENT" } }),
      prisma.emailLog.count({ where: { status: "FAILED" } }),
      prisma.emailLog.count({ where: { status: "PENDING" } }),
      prisma.emailLog.count({ where: { createdAt: { gte: today } } }),
      prisma.emailLog.groupBy({
        by: ["type"],
        _count: { type: true },
        orderBy: { _count: { type: "desc" } },
        take: 1,
      }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      today: today_count,
      successRate: total > 0 ? Math.round((sent / total) * 100) : 0,
      mostSentType: typeGroups[0]?.type ?? null,
    };
  } catch {
    return {
      total: 0, sent: 0, failed: 0, pending: 0, today: 0,
      successRate: 0, mostSentType: null,
    };
  }
}

export async function resendFailedEmail(logId: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  requireAdmin(session);

  const log = await prisma.emailLog.findUnique({
    where: { id: logId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!log) return { success: false, message: "Email log not found" };
  if (log.status !== "FAILED") return { success: false, message: "Only failed emails can be resent" };

  const { referenceId, type, email } = log;

  try {
    const ORDER_TYPES: EmailType[] = [
      "ORDER_CONFIRMATION", "PAYMENT_SUCCESS",
      "ORDER_CONFIRMED", "ORDER_PACKED", "ORDER_SHIPPED",
      "OUT_FOR_DELIVERY", "ORDER_DELIVERED", "ORDER_CANCELLED",
      "REFUND_PROCESSED",
    ];

    if (ORDER_TYPES.includes(type) && referenceId) {
      const order = await prisma.order.findUnique({
        where: { id: referenceId },
        include: { user: true, items: true, address: true, coupon: true },
      });

      if (!order) return { success: false, message: "Order not found" };

      const recipientEmail = email;
      const customerName = order.user?.name ?? "Customer";
      const orderDate = order.createdAt.toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      });

      if (type === "ORDER_CONFIRMATION") {
        sendOrderConfirmationEmail(
          recipientEmail,
          {
            customerName,
            orderNumber: order.orderNumber,
            orderDate,
            items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, image: i.image ?? null })),
            subtotal: order.subtotal,
            discount: order.discount,
            shippingCost: order.shippingCost,
            total: order.total,
            couponCode: order.coupon?.code ?? null,
            address: order.address,
            paymentMethod: order.paymentMethod,
          },
          order.userId,
          order.id
        );
      } else if (type === "PAYMENT_SUCCESS") {
        sendPaymentSuccessEmail(
          recipientEmail,
          {
            customerName,
            orderNumber: order.orderNumber,
            paymentId: order.paymentId ?? "N/A",
            amount: order.total,
            paymentDate: orderDate,
          },
          order.userId,
          order.id
        );
      } else if (type === "REFUND_PROCESSED") {
        sendRefundProcessedEmail(
          recipientEmail,
          {
            customerName,
            orderNumber: order.orderNumber,
            refundAmount: order.total,
            refundId: order.paymentId ?? `REF-${order.id.slice(-8).toUpperCase()}`,
          },
          order.userId,
          order.id
        );
      } else {
        sendOrderStatusEmail(
          recipientEmail,
          { customerName, orderNumber: order.orderNumber, status: order.status, orderId: order.id },
          order.userId
        );
      }
    } else if (type === "WELCOME" && referenceId) {
      const u = await prisma.user.findUnique({
        where: { id: referenceId },
        select: { name: true, email: true },
      });
      if (u?.email) {
        sendWelcomeEmail(u.email, u.name, referenceId);
      }
    } else {
      return { success: false, message: "Cannot resend this email type automatically" };
    }

    return { success: true, message: "Email queued for resend" };
  } catch {
    return { success: false, message: "Failed to resend email" };
  }
}

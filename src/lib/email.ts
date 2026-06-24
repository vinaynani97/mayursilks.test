import { Resend } from "resend";
import { prisma } from "@/lib/db";
import type { EmailType } from "@prisma/client";
import {
  welcomeTemplate,
  orderConfirmationTemplate,
  paymentSuccessTemplate,
  orderStatusTemplate,
  refundProcessedTemplate,
  adminNewOrderTemplate,
  adminLowStockTemplate,
  adminOutOfStockTemplate,
  adminDailySummaryTemplate,
  adminPaymentFailedTemplate,
  type OrderConfirmationData,
  type PaymentSuccessData,
  type OrderStatusData,
  type RefundProcessedData,
  type AdminNewOrderData,
  type AdminLowStockData,
  type AdminOutOfStockData,
  type AdminDailySummaryData,
  type AdminPaymentFailedData,
} from "@/lib/email-templates";

export const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD ?? "5");

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function getFrom(): string {
  const name = process.env.EMAIL_FROM_NAME ?? "Mayur Silks";
  const addr = process.env.EMAIL_FROM_ADDRESS ?? "noreply@mayursilks.com";
  return `${name} <${addr}>`;
}

async function isEmailEnabled(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const setting = await prisma.siteSetting
    .findUnique({ where: { key: "email_notifications_enabled" } })
    .catch(() => null);
  return setting ? setting.value !== "false" : true;
}

async function sendEmail({
  to,
  subject,
  html,
  type,
  userId,
  referenceId,
}: {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string;
  referenceId?: string;
}): Promise<void> {
  const enabled = await isEmailEnabled();
  if (!enabled) return;

  const log = await prisma.emailLog.create({
    data: {
      email: to,
      subject,
      type,
      status: "PENDING",
      provider: "resend",
      userId: userId ?? null,
      referenceId: referenceId ?? null,
    },
  });

  const resend = getResend();
  if (!resend) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "FAILED", errorMessage: "RESEND_API_KEY not configured" },
    });
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: getFrom(),
      to,
      subject,
      html,
    });

    if (error) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: "FAILED", errorMessage: error.message },
      });
      return;
    }

    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (err) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      },
    });
  }
}

// ─── Customer Emails ────────────────────────────────────────

export function sendWelcomeEmail(email: string, name: string, userId?: string): void {
  void sendEmail({
    to: email,
    subject: `Welcome to Mayur Silks — Your Handloom Journey Begins`,
    html: welcomeTemplate(name),
    type: "WELCOME",
    userId,
    referenceId: userId,
  });
}

export function sendOrderConfirmationEmail(
  email: string,
  data: OrderConfirmationData,
  userId?: string,
  orderId?: string
): void {
  void sendEmail({
    to: email,
    subject: `Order Confirmed — #${data.orderNumber} | Mayur Silks`,
    html: orderConfirmationTemplate(data),
    type: "ORDER_CONFIRMATION",
    userId,
    referenceId: orderId,
  });
}

export function sendPaymentSuccessEmail(
  email: string,
  data: PaymentSuccessData,
  userId?: string,
  orderId?: string
): void {
  void sendEmail({
    to: email,
    subject: `✅ Payment Confirmed — #${data.orderNumber} | Mayur Silks`,
    html: paymentSuccessTemplate(data),
    type: "PAYMENT_SUCCESS",
    userId,
    referenceId: orderId,
  });
}

export function sendOrderStatusEmail(
  email: string,
  data: OrderStatusData,
  userId?: string
): void {
  const statusTypeMap: Record<string, EmailType> = {
    CONFIRMED: "ORDER_CONFIRMED",
    PACKED: "ORDER_PACKED",
    SHIPPED: "ORDER_SHIPPED",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "ORDER_DELIVERED",
    CANCELLED: "ORDER_CANCELLED",
  };

  const type = statusTypeMap[data.status];
  if (!type) return;

  const subjectMap: Record<string, string> = {
    CONFIRMED: `✅ Order Confirmed`,
    PACKED: `📦 Order Packed`,
    SHIPPED: `🚚 Your Order Is Shipped`,
    OUT_FOR_DELIVERY: `🏠 Out for Delivery`,
    DELIVERED: `🎉 Order Delivered`,
    CANCELLED: `❌ Order Cancelled`,
  };

  const subject = `${subjectMap[data.status] ?? "Order Update"} — #${data.orderNumber} | Mayur Silks`;

  void sendEmail({
    to: email,
    subject,
    html: orderStatusTemplate(data),
    type,
    userId,
    referenceId: data.orderId,
  });
}

export function sendRefundProcessedEmail(
  email: string,
  data: RefundProcessedData,
  userId?: string,
  orderId?: string
): void {
  void sendEmail({
    to: email,
    subject: `💸 Refund Processed — #${data.orderNumber} | Mayur Silks`,
    html: refundProcessedTemplate(data),
    type: "REFUND_PROCESSED",
    userId,
    referenceId: orderId,
  });
}

// ─── Admin Emails ───────────────────────────────────────────

export function sendAdminNewOrderEmail(data: AdminNewOrderData): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  void sendEmail({
    to: adminEmail,
    subject: `🛍️ New Order #${data.orderNumber} — ${data.customerName} — ₹${data.total.toLocaleString("en-IN")}`,
    html: adminNewOrderTemplate(data),
    type: "ADMIN_NEW_ORDER",
    referenceId: data.orderId,
  });
}

export function sendAdminLowStockEmail(data: AdminLowStockData): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  void sendEmail({
    to: adminEmail,
    subject: `⚠️ Low Stock — ${data.productName} (${data.currentStock} left)`,
    html: adminLowStockTemplate(data),
    type: "ADMIN_LOW_STOCK",
    referenceId: data.productId,
  });
}

export function sendAdminOutOfStockEmail(data: AdminOutOfStockData): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  void sendEmail({
    to: adminEmail,
    subject: `🚨 Out of Stock — ${data.productName} needs immediate restock`,
    html: adminOutOfStockTemplate(data),
    type: "ADMIN_OUT_OF_STOCK",
    referenceId: data.productId,
  });
}

export function sendAdminDailySummaryEmail(data: AdminDailySummaryData): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  void sendEmail({
    to: adminEmail,
    subject: `📊 Daily Summary — ${data.date} — Mayur Silks`,
    html: adminDailySummaryTemplate(data),
    type: "ADMIN_DAILY_SUMMARY",
  });
}

export function sendAdminPaymentFailedEmail(data: AdminPaymentFailedData): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  void sendEmail({
    to: adminEmail,
    subject: `💳 Payment Failed — ${data.customerName} — ${data.customerEmail}`,
    html: adminPaymentFailedTemplate(data),
    type: "ADMIN_PAYMENT_FAILED",
  });
}

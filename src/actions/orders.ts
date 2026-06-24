"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendOrderStatusEmail, sendRefundProcessedEmail } from "@/lib/email";

type OrderStatus =
  | "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED"
  | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";

const VALID_STATUSES: OrderStatus[] = [
  "PLACED", "CONFIRMED", "PACKED", "SHIPPED",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED",
];

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getOrders(options?: {
  userId?: string;
  status?: string;
  limit?: number;
}) {
  try {
    return await prisma.order.findMany({
      where: {
        ...(options?.userId && { userId: options.userId }),
        ...(options?.status && { status: options.status as OrderStatus }),
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
      ...(options?.limit && { take: options.limit }),
    });
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  meta?: {
    trackingNumber?: string;
    courierPartner?: string;
    cancellationReason?: string;
  }
) {
  const session = await auth();
  requireAdmin(session);

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid status");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        status: true,
        userId: true,
        paymentId: true,
        total: true,
        items: { select: { productId: true, quantity: true } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!existing) throw new Error("Order not found");

    // Restore stock when cancelling a non-already-cancelled order
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
      for (const item of existing.items) {
        const before = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });
        const stockBefore = before?.stock ?? 0;
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
          select: { stock: true },
        });
        if (product.stock > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { availability: "IN_STOCK" },
          });
        }
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            orderId,
            type: "ORDER_CANCELLED",
            change: item.quantity,
            stockBefore,
            stockAfter: product.stock,
            reason: `Order ${existing.orderNumber} cancelled by admin`,
          },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: status as OrderStatus,
        ...(status === "SHIPPED" && {
          trackingNumber: meta?.trackingNumber ?? null,
          courierPartner: meta?.courierPartner ?? null,
        }),
      },
    });

    return existing;
  });

  // Customer status email
  if (updatedOrder?.user?.email) {
    sendOrderStatusEmail(
      updatedOrder.user.email,
      {
        customerName: updatedOrder.user.name ?? "Customer",
        orderNumber: updatedOrder.orderNumber,
        status,
        orderId,
        trackingNumber: meta?.trackingNumber,
        courierPartner: meta?.courierPartner,
        cancellationReason: meta?.cancellationReason,
      },
      updatedOrder.userId
    );
  }

  // Refund email when order is marked as RETURNED
  if (status === "RETURNED" && updatedOrder?.user?.email) {
    sendRefundProcessedEmail(
      updatedOrder.user.email,
      {
        customerName: updatedOrder.user.name ?? "Customer",
        orderNumber: updatedOrder.orderNumber,
        refundAmount: updatedOrder.total,
        refundId: updatedOrder.paymentId ?? `REF-${orderId.slice(-8).toUpperCase()}`,
      },
      updatedOrder.userId,
      orderId
    );
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

// Customer: cancel own order (only when PLACED)
export async function cancelOrder(orderId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      orderNumber: true,
      userId: true,
      status: true,
      items: { select: { productId: true, quantity: true } },
    },
  });

  if (!order || order.userId !== session.user.id) throw new Error("Order not found");
  if (order.status !== "PLACED") throw new Error("Order cannot be cancelled at this stage");

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const before = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      });
      const stockBefore = before?.stock ?? 0;
      const product = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
        select: { stock: true },
      });
      if (product.stock > 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { availability: "IN_STOCK" },
        });
      }
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          orderId,
          type: "ORDER_CANCELLED",
          change: item.quantity,
          stockBefore,
          stockAfter: product.stock,
          reason: `Order ${order.orderNumber} cancelled by customer`,
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}

export async function getAdminOrderStats() {
  try {
    const [totalOrders, totalRevenue, pendingOrders, deliveredOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count({ where: { status: "PLACED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      pendingOrders,
      deliveredOrders,
    };
  } catch {
    return { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 };
  }
}

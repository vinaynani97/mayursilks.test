"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getInventoryStats() {
  try {
    const [totalStockAgg, lowStockCount, outOfStockCount, reservedAgg] = await Promise.all([
      prisma.product.aggregate({ _sum: { stock: true } }),
      prisma.product.count({
        where: { stock: { gt: 0, lte: LOW_STOCK_THRESHOLD }, availability: "IN_STOCK" },
      }),
      prisma.product.count({
        where: { OR: [{ stock: { lte: 0 } }, { availability: "OUT_OF_STOCK" }] },
      }),
      prisma.cartItem.aggregate({ _sum: { quantity: true } }),
    ]);

    return {
      totalStock: totalStockAgg._sum.stock ?? 0,
      lowStockCount,
      outOfStockCount,
      reservedStock: reservedAgg._sum.quantity ?? 0,
    };
  } catch {
    return { totalStock: 0, lowStockCount: 0, outOfStockCount: 0, reservedStock: 0 };
  }
}

export type InventoryProduct = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  availability: string;
  images: string[];
  category: string;
};

export async function getInventoryProducts(options?: {
  search?: string;
  filter?: "all" | "low" | "out";
}): Promise<InventoryProduct[]> {
  try {
    const filter = options?.filter ?? "all";
    const search = options?.search;

    const products = await prisma.product.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(filter === "low" && {
          stock: { gt: 0, lte: LOW_STOCK_THRESHOLD },
          availability: "IN_STOCK",
        }),
        ...(filter === "out" && {
          OR: [{ stock: { lte: 0 } }, { availability: "OUT_OF_STOCK" }],
        }),
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        availability: true,
        images: true,
        category: { select: { name: true } },
        orderItems: { select: { quantity: true } },
      },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });

    return products.map((p) => {
      const reserved = p.orderItems.reduce((sum, i) => sum + i.quantity, 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        reservedStock: reserved,
        availableStock: Math.max(0, p.stock - reserved),
        availability: p.availability,
        images: p.images,
        category: p.category.name,
      };
    });
  } catch {
    return [];
  }
}

export type InventoryLogEntry = {
  id: string;
  type: string;
  change: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  createdAt: Date;
  product: { name: string; sku: string };
  order: { orderNumber: string } | null;
};

export async function getInventoryHistory(options?: {
  productId?: string;
  limit?: number;
}): Promise<InventoryLogEntry[]> {
  try {
    const rows = await prisma.inventoryLog.findMany({
      where: options?.productId ? { productId: options.productId } : undefined,
      include: {
        product: { select: { name: true, sku: true } },
        order: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 100,
    });

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      change: r.change,
      stockBefore: r.stockBefore,
      stockAfter: r.stockAfter,
      reason: r.reason,
      createdAt: r.createdAt,
      product: r.product,
      order: r.order,
    }));
  } catch {
    return [];
  }
}

export async function adjustStock(
  productId: string,
  adjustType: "ADD" | "REMOVE",
  quantity: number,
  reason: string
) {
  const session = await auth();
  requireAdmin(session);

  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  if (!reason.trim()) throw new Error("Reason is required");

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });
    if (!product) throw new Error("Product not found");

    const change = adjustType === "ADD" ? quantity : -quantity;
    const newStock = Math.max(0, product.stock + change);

    await tx.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        availability: newStock <= 0 ? "OUT_OF_STOCK" : "IN_STOCK",
      },
    });

    await tx.inventoryLog.create({
      data: {
        productId,
        type: adjustType === "ADD" ? "MANUAL_ADD" : "MANUAL_REMOVE",
        change,
        stockBefore: product.stock,
        stockAfter: newStock,
        reason: reason.trim(),
      },
    });
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true };
}

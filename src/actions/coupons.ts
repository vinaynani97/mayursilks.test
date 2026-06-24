"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export type CouponRow = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  minOrderAmt: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  perUserLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { orders: number };
};

export type CouponStats = {
  totalCoupons: number;
  activeCoupons: number;
  totalUses: number;
  totalDiscountGiven: number;
};

export type ValidateCouponResult =
  | { valid: true; discount: number; code: string; type: string; value: number; maxDiscount: number | null; description: string | null }
  | { valid: false; message: string };

export type CouponFormData = {
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmt?: number;
  maxDiscount?: number;
  maxUses?: number;
  perUserLimit?: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
};

export async function getCoupons(): Promise<CouponRow[]> {
  try {
    return await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });
  } catch {
    return [];
  }
}

export async function getCouponStats(): Promise<CouponStats> {
  try {
    const [totalCoupons, activeCoupons, orders] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.order.findMany({
        where: { couponId: { not: null } },
        select: { discount: true },
      }),
    ]);
    return {
      totalCoupons,
      activeCoupons,
      totalUses: orders.length,
      totalDiscountGiven: orders.reduce((sum, o) => sum + o.discount, 0),
    };
  } catch {
    return { totalCoupons: 0, activeCoupons: 0, totalUses: 0, totalDiscountGiven: 0 };
  }
}

export async function validateCoupon(
  code: string,
  orderAmount: number,
  userId?: string
): Promise<ValidateCouponResult> {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) return { valid: false, message: "Invalid coupon code" };
    if (!coupon.isActive) return { valid: false, message: "This coupon is inactive" };

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) return { valid: false, message: "This coupon is not active yet" };
    if (coupon.expiresAt && coupon.expiresAt < now) return { valid: false, message: "This coupon has expired" };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, message: "Coupon usage limit has been reached" };
    if (coupon.minOrderAmt && orderAmount < coupon.minOrderAmt) {
      return {
        valid: false,
        message: `Minimum order ₹${coupon.minOrderAmt.toLocaleString("en-IN")} required for this coupon`,
      };
    }

    if (userId && coupon.perUserLimit) {
      const userUses = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userUses >= coupon.perUserLimit) {
        return { valid: false, message: "You have already used this coupon the maximum number of times" };
      }
    }

    let discount =
      coupon.type === "PERCENTAGE"
        ? Math.round((orderAmount * coupon.value) / 100)
        : coupon.value;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    discount = Math.min(discount, orderAmount);

    return {
      valid: true,
      discount,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      description: coupon.description,
    };
  } catch {
    return { valid: false, message: "Could not validate coupon. Please try again." };
  }
}

export async function createCoupon(data: CouponFormData) {
  const session = await auth();
  requireAdmin(session);

  const existing = await prisma.coupon.findUnique({
    where: { code: data.code.toUpperCase().trim() },
  });
  if (existing) throw new Error("A coupon with this code already exists");

  await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase().trim(),
      description: data.description?.trim() || null,
      type: data.type,
      value: data.value,
      minOrderAmt: data.minOrderAmt || null,
      maxDiscount: data.maxDiscount || null,
      maxUses: data.maxUses || null,
      perUserLimit: data.perUserLimit || null,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, data: CouponFormData) {
  const session = await auth();
  requireAdmin(session);

  const existing = await prisma.coupon.findFirst({
    where: { code: data.code.toUpperCase().trim(), NOT: { id } },
  });
  if (existing) throw new Error("A coupon with this code already exists");

  await prisma.coupon.update({
    where: { id },
    data: {
      code: data.code.toUpperCase().trim(),
      description: data.description?.trim() || null,
      type: data.type,
      value: data.value,
      minOrderAmt: data.minOrderAmt || null,
      maxDiscount: data.maxDiscount || null,
      maxUses: data.maxUses || null,
      perUserLimit: data.perUserLimit || null,
      isActive: data.isActive,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponStatus(id: string, isActive: boolean) {
  const session = await auth();
  requireAdmin(session);

  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const session = await auth();
  requireAdmin(session);

  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

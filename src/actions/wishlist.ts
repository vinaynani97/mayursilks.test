"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getWishlist(userId: string) {
  try {
    return await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getWishlistProductIds(userId: string) {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
    });
    return items.map((i) => i.productId);
  } catch {
    return [];
  }
}

export async function toggleWishlist(userId: string, productId: string) {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    revalidatePath("/account/wishlist");
    return { success: true, action: "removed" as const };
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
    revalidatePath("/wishlist");
    revalidatePath("/account/wishlist");
    return { success: true, action: "added" as const };
  }
}

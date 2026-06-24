"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
}) {
  try {
    return await prisma.product.findMany({
      where: {
        ...(options?.categorySlug && {
          category: { slug: options.categorySlug },
        }),
        ...(options?.isNew !== undefined && { isNew: options.isNew }),
        ...(options?.isBestSeller !== undefined && { isBestSeller: options.isBestSeller }),
        ...(options?.isFeatured !== undefined && { isFeatured: options.isFeatured }),
        ...(options?.search && {
          OR: [
            { name: { contains: options.search, mode: "insensitive" } },
            { color: { contains: options.search, mode: "insensitive" } },
            { fabric: { contains: options.search, mode: "insensitive" } },
          ],
        }),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      ...(options?.limit && { take: options.limit }),
    });
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const sku = `MS-${Date.now()}`;
  const images = formData.getAll("images") as string[];

  const product = await prisma.product.create({
    data: {
      slug,
      sku,
      name,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      originalPrice: formData.get("originalPrice")
        ? parseInt(formData.get("originalPrice") as string)
        : null,
      images,
      fabric: formData.get("fabric") as string,
      weavingTechnique: formData.get("weavingTechnique") as string,
      designDetails: formData.get("designDetails") as string,
      length: formData.get("length") as string,
      color: formData.get("color") as string,
      availability: (formData.get("availability") as "IN_STOCK" | "OUT_OF_STOCK" | "MADE_TO_ORDER") ?? "IN_STOCK",
      stock: parseInt((formData.get("stock") as string) || "0"),
      isNew: formData.get("isNew") === "true",
      isBestSeller: formData.get("isBestSeller") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
      categoryId: formData.get("categoryId") as string,
    },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, product };
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const name = formData.get("name") as string;
  const images = formData.getAll("images") as string[];

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      originalPrice: formData.get("originalPrice")
        ? parseInt(formData.get("originalPrice") as string)
        : null,
      ...(images.length > 0 && { images }),
      fabric: formData.get("fabric") as string,
      weavingTechnique: formData.get("weavingTechnique") as string,
      designDetails: formData.get("designDetails") as string,
      length: formData.get("length") as string,
      color: formData.get("color") as string,
      availability: (formData.get("availability") as "IN_STOCK" | "OUT_OF_STOCK" | "MADE_TO_ORDER") ?? "IN_STOCK",
      stock: parseInt((formData.get("stock") as string) || "0"),
      isNew: formData.get("isNew") === "true",
      isBestSeller: formData.get("isBestSeller") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
      categoryId: formData.get("categoryId") as string,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, product };
}

export async function deleteProduct(id: string) {
  const session = await auth();
  requireAdmin(session);

  const product = await prisma.product.delete({ where: { id } });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true, slug: product.slug };
}

export async function toggleProductFlag(
  id: string,
  flag: "isNew" | "isBestSeller" | "isFeatured",
  value: boolean
) {
  const session = await auth();
  requireAdmin(session);

  await prisma.product.update({ where: { id }, data: { [flag]: value } });
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}

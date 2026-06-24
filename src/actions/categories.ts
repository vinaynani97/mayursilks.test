"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getCategories(activeOnly = false) {
  try {
    return await prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string) || null,
      sortOrder: parseInt((formData.get("sortOrder") as string) || "0"),
      isActive: formData.get("isActive") !== "false",
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, category };
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      image: (formData.get("image") as string) || null,
      sortOrder: parseInt((formData.get("sortOrder") as string) || "0"),
      isActive: formData.get("isActive") !== "false",
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true, category };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  requireAdmin(session);

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
  const session = await auth();
  requireAdmin(session);

  await prisma.category.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/categories");
  return { success: true };
}

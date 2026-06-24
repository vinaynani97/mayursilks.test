"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getBlogs(publishedOnly = false) {
  try {
    return await prisma.blog.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    return await prisma.blog.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function createBlog(formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const title = formData.get("title") as string;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const isPublished = formData.get("isPublished") === "true";

  const blog = await prisma.blog.create({
    data: {
      slug,
      title,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      coverImage: (formData.get("coverImage") as string) || null,
      author: formData.get("author") as string,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
      readingTime: parseInt((formData.get("readingTime") as string) || "5"),
    },
  });

  revalidatePath("/blogs");
  revalidatePath("/admin/blogs");
  revalidatePath("/");
  return { success: true, blog };
}

export async function updateBlog(id: string, formData: FormData) {
  const session = await auth();
  requireAdmin(session);

  const isPublished = formData.get("isPublished") === "true";
  const existing = await prisma.blog.findUnique({ where: { id } });

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string,
      content: formData.get("content") as string,
      coverImage: (formData.get("coverImage") as string) || null,
      author: formData.get("author") as string,
      isPublished,
      publishedAt: isPublished && !existing?.publishedAt ? new Date() : existing?.publishedAt,
      tags: (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
      readingTime: parseInt((formData.get("readingTime") as string) || "5"),
    },
  });

  revalidatePath("/blogs");
  revalidatePath(`/blogs/${blog.slug}`);
  revalidatePath("/admin/blogs");
  return { success: true, blog };
}

export async function deleteBlog(id: string) {
  const session = await auth();
  requireAdmin(session);

  const blog = await prisma.blog.delete({ where: { id } });
  revalidatePath("/blogs");
  revalidatePath("/admin/blogs");
  revalidatePath("/");
  return { success: true, slug: blog.slug };
}

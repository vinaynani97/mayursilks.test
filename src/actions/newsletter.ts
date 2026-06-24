"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function subscribeNewsletter(email: string, name?: string) {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, name },
      create: { email, name, isActive: true },
    });
    return { success: true };
  } catch {
    return { success: false, message: "Already subscribed or invalid email" };
  }
}

export async function getNewsletterSubscribers() {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    return await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function deleteSubscriber(id: string) {
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
  return { success: true };
}

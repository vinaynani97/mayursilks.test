"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const pwError = validatePassword(data.password);
  if (pwError) return { success: false, message: pwError };

  const phone = data.phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return { success: false, message: "Enter a valid 10-digit Indian mobile number" };
  }

  const [byEmail, byPhone] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email } }),
    prisma.user.findUnique({ where: { phone } }),
  ]);

  if (byEmail) return { success: false, message: "Email is already registered" };
  if (byPhone) return { success: false, message: "Mobile number is already registered" };

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      phone,
      role: "CUSTOMER",
    },
  });

  sendWelcomeEmail(data.email, data.name, user.id);
  return { success: true };
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        addresses: true,
      },
    });
  } catch {
    return null;
  }
}

export async function updateUserProfile(id: string, data: {
  name?: string;
  phone?: string;
  avatar?: string;
}) {
  const user = await prisma.user.update({ where: { id }, data });
  return { success: true, user };
}

export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user?.password) return { success: false, message: "No password set" };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { success: false, message: "Current password is incorrect" };

  const pwError = validatePassword(newPassword);
  if (pwError) return { success: false, message: pwError };

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return { success: true };
}

export async function getAdminStats() {
  try {
    const [customers, products, orders, revenue] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);

    return {
      customers,
      products,
      orders,
      revenue: revenue._sum.total ?? 0,
    };
  } catch {
    return { customers: 0, products: 0, orders: 0, revenue: 0 };
  }
}

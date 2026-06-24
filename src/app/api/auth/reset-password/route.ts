import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    const pwError = validatePassword(password);
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[ResetPassword]", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

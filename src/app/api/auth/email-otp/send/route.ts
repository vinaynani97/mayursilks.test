import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmailOtp } from "@/lib/email-otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "A valid name is required." }, { status: 400 });
    }

    // Fail fast: check if email is already registered before sending OTP
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered. Please login instead." },
        { status: 409 }
      );
    }

    const result = await sendEmailOtp(email, name);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      // devOtp is only present when NODE_ENV !== "production"
      ...(result.devOtp !== undefined && { devOtp: result.devOtp }),
    });
  } catch (err) {
    console.error("[POST /api/auth/email-otp/send]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

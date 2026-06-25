import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOtp } from "@/lib/email-otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "A 6-digit verification code is required." }, { status: 400 });
    }

    const result = await verifyEmailOtp(email, otp);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          ...(result.attemptsLeft !== undefined && { attemptsLeft: result.attemptsLeft }),
        },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/email-otp/verify]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

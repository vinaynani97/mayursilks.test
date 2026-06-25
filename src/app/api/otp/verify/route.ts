import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/msg91";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;

    if (
      !body ||
      typeof body.phone !== "string" ||
      !body.phone.trim() ||
      typeof body.otp !== "string" ||
      !body.otp.trim()
    ) {
      return NextResponse.json(
        { error: "phone and otp are required" },
        { status: 400 }
      );
    }

    const result = await verifyOTP(body.phone.trim(), body.otp.trim());

    if (!result.success) {
      const status = result.message.includes("expired")
        ? 410
        : result.message.includes("attempts")
        ? 429
        : 400;

      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (e) {
    console.error("[POST /api/otp/verify]", e);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}

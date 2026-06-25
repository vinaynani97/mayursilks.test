import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/msg91";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;

    if (!body || typeof body.phone !== "string" || !body.phone.trim()) {
      return NextResponse.json(
        { error: "phone is required" },
        { status: 400 }
      );
    }

    const result = await sendOTP(body.phone.trim());

    if (!result.success) {
      const status = result.message.includes("wait")
        ? 429
        : result.message.includes("could not be delivered")
        ? 503
        : 400;

      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      // otp is only present in development mode
      ...(result.otp !== undefined && { otp: result.otp }),
    });
  } catch (e) {
    console.error("[POST /api/otp/send]", e);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

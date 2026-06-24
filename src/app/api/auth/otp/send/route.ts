import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    const recent = await prisma.otpCode.findFirst({
      where: { mobile, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });
    if (recent) {
      const waitSecs = Math.ceil((recent.createdAt.getTime() + 60_000 - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSecs}s before requesting a new OTP` },
        { status: 429 }
      );
    }

    await prisma.otpCode.deleteMany({ where: { mobile } });

    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60_000);

    await prisma.otpCode.create({ data: { mobile, code, expiresAt } });

    // Production: await sendSms(mobile, `Your Mayur Silks OTP is ${code}. Valid for 10 minutes.`);

    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      ...(isDev && { otp: code }),
    });
  } catch (e) {
    console.error("[OTP Send]", e);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

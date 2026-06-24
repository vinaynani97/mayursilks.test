import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function sendViaMSG91(mobile: string, otp: string): Promise<boolean> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID ?? "MAYURSILKS";

  if (!authKey || !templateId) return false;

  const res = await fetch("https://api.msg91.com/api/v5/otp", {
    method: "POST",
    headers: { authkey: authKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      template_id: templateId,
      mobile: `91${mobile}`,
      otp,
      sender: senderId,
    }),
  });
  const data = (await res.json()) as { type?: string; message?: string };
  if (data.type !== "success") {
    console.error("[OTP MSG91] Error:", data);
    return false;
  }
  return true;
}

async function sendViaTwilio(mobile: string, otp: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) return false;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: `+91${mobile}`,
        Body: `Your Mayur Silks OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`,
      }).toString(),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[OTP Twilio] Error:", err);
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { mobile } = await req.json();

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    const recent = await prisma.otpCode.findFirst({
      where: { mobile, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });
    if (recent) {
      const waitSecs = Math.ceil(
        (recent.createdAt.getTime() + 60_000 - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: `Please wait ${waitSecs}s before requesting a new OTP` },
        { status: 429 }
      );
    }

    await prisma.otpCode.deleteMany({ where: { mobile } });

    const code = Math.floor(100_000 + Math.random() * 900_000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60_000);

    await prisma.otpCode.create({ data: { mobile, code, expiresAt } });

    const isDev = process.env.NODE_ENV !== "production";

    if (!isDev) {
      const sent =
        (await sendViaMSG91(mobile, code).catch(() => false)) ||
        (await sendViaTwilio(mobile, code).catch(() => false));

      if (!sent) {
        console.error(
          `[OTP] Failed to deliver OTP to +91${mobile}. ` +
            "Configure MSG91_AUTH_KEY + MSG91_TEMPLATE_ID or TWILIO_* env vars on Vercel."
        );
        return NextResponse.json(
          { error: "OTP could not be delivered. Please try again or contact support." },
          { status: 503 }
        );
      }
    }

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

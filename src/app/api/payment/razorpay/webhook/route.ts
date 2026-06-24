import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendAdminPaymentFailedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload?: Record<string, unknown> };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "payment.failed") {
    const payment = (event.payload?.payment as { entity?: Record<string, string> })?.entity;

    const customerEmail = payment?.email ?? "";
    const reason =
      payment?.error_description ??
      payment?.error_code ??
      "Payment was declined";

    let customerName = "Customer";
    if (customerEmail) {
      const user = await prisma.user.findUnique({
        where: { email: customerEmail },
        select: { name: true },
      }).catch(() => null);
      if (user) customerName = user.name;
    }

    sendAdminPaymentFailedEmail({
      customerName,
      customerEmail: customerEmail || "N/A",
      orderId: payment?.order_id ?? "N/A",
      reason,
    });
  }

  return NextResponse.json({ received: true });
}

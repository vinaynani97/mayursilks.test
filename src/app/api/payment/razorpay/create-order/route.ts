import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/db";
import { validateCoupon } from "@/actions/coupons";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { couponCode?: string };

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: { select: { price: true, stock: true, availability: true } } } },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const item of cart.items) {
    if (item.product.availability === "OUT_OF_STOCK" || item.product.stock < item.quantity) {
      return NextResponse.json({ error: "One or more items are out of stock" }, { status: 400 });
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (body.couponCode) {
    const validation = await validateCoupon(body.couponCode, subtotal, session.user.id);
    if (validation.valid) {
      discount = validation.discount;
    }
  }

  const chargeAmount = subtotal - discount;

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: chargeAmount * 100, // paise
      currency: "INR",
      receipt: `ms_${Date.now()}`,
    });

    return NextResponse.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      discount,
    });
  } catch (err) {
    console.error("Razorpay create order failed:", err);
    return NextResponse.json({ error: "Payment gateway error" }, { status: 500 });
  }
}

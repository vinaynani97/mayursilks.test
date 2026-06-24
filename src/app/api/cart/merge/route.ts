import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type GuestItem = { productId: string; quantity: number };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items }: { items: GuestItem[] } = await req.json();
  if (!items?.length) return NextResponse.json({ success: true });

  const userId = session.user.id;
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) cart = await prisma.cart.create({ data: { userId } });

  for (const guestItem of items) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: guestItem.productId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.max(existing.quantity, guestItem.quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: guestItem.productId, quantity: guestItem.quantity },
      }).catch(() => null); // product may not exist
    }
  }

  return NextResponse.json({ success: true });
}

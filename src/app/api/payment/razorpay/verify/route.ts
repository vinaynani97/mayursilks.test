import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import {
  sendOrderConfirmationEmail,
  sendPaymentSuccessEmail,
  sendAdminNewOrderEmail,
  sendAdminLowStockEmail,
  sendAdminOutOfStockEmail,
  LOW_STOCK_THRESHOLD,
} from "@/lib/email";
import { createNotification, createAdminNotification } from "@/lib/notifications";
import { getCloudinaryUrl } from "@/lib/utils";

interface NewAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    addressId,
    newAddress,
    notes,
    couponCode,
  } = body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    addressId?: string;
    newAddress?: NewAddress;
    notes?: string;
    couponCode?: string;
  };

  // 1. Verify Razorpay signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const userId = session.user.id;

  // 2. Load cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, images: true, stock: true },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // 3. Final stock check
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for "${item.product.name}"` },
        { status: 400 }
      );
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 4. Re-validate coupon inside the transaction context
  let discount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (coupon && coupon.isActive) {
      const now = new Date();
      const notExpired = !coupon.expiresAt || coupon.expiresAt > now;
      const notStarted = coupon.startsAt && coupon.startsAt > now;
      const withinLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
      const meetsMinOrder = !coupon.minOrderAmt || subtotal >= coupon.minOrderAmt;

      let perUserOk = true;
      if (coupon.perUserLimit) {
        const userUses = await prisma.couponUsage.count({
          where: { couponId: coupon.id, userId },
        });
        perUserOk = userUses < coupon.perUserLimit;
      }

      if (notExpired && !notStarted && withinLimit && meetsMinOrder && perUserOk) {
        discount =
          coupon.type === "PERCENTAGE"
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }
  }

  const total = subtotal - discount;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Create address if new
      let finalAddressId = addressId;
      if (!addressId && newAddress) {
        const addr = await tx.address.create({
          data: { ...newAddress, userId },
        });
        finalAddressId = addr.id;
      }

      if (!finalAddressId) throw new Error("No address provided");

      const year = new Date().getFullYear().toString().slice(-2);
      const rand = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `MS${year}${rand}`;

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: finalAddressId,
          subtotal,
          shippingCost: 0,
          discount,
          total,
          paymentMethod: "razorpay",
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          status: "PLACED",
          notes: notes ?? null,
          couponId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              image: item.product.images[0] ?? null,
            })),
          },
        },
      });

      // Reduce stock and log each product
      for (const item of cart.items) {
        const newStock = item.product.stock - item.quantity;
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: newStock,
            availability: newStock <= 0 ? "OUT_OF_STOCK" : "IN_STOCK",
          },
        });
        await tx.inventoryLog.create({
          data: {
            productId: item.product.id,
            orderId: created.id,
            type: "ORDER_PLACED",
            change: -item.quantity,
            stockBefore: item.product.stock,
            stockAfter: newStock,
            reason: `Order ${created.orderNumber} placed`,
          },
        });
      }

      // Record coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: { couponId, userId },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    // ── Post-order emails (fire and forget) ──────────────
    const userEmail = session.user.email;
    const userName = (session.user as { name?: string }).name ?? "Customer";

    const [emailAddress, userRecord] = await Promise.all([
      prisma.address.findUnique({ where: { id: order.addressId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { phone: true } }),
    ]);

    const orderDate = order.createdAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const emailItems = cart.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images[0]
        ? getCloudinaryUrl(item.product.images[0], 120, 144)
        : null,
    }));

    if (userEmail && emailAddress) {
      // Order confirmation email
      sendOrderConfirmationEmail(
        userEmail,
        {
          customerName: userName,
          orderNumber: order.orderNumber,
          orderDate,
          items: emailItems,
          subtotal,
          discount,
          shippingCost: 0,
          total,
          couponCode: couponCode ?? null,
          address: emailAddress,
          paymentMethod: "razorpay",
        },
        userId,
        order.id
      );

      // Payment success receipt
      sendPaymentSuccessEmail(
        userEmail,
        {
          customerName: userName,
          orderNumber: order.orderNumber,
          paymentId: razorpay_payment_id,
          amount: total,
          paymentDate: orderDate,
        },
        userId,
        order.id
      );
    }

    // Admin new order alert (full details)
    if (emailAddress) {
      sendAdminNewOrderEmail({
        orderNumber: order.orderNumber,
        orderDate,
        customerName: userName,
        customerEmail: userEmail ?? "N/A",
        customerPhone: userRecord?.phone ?? undefined,
        subtotal,
        discount,
        total,
        couponCode: couponCode ?? null,
        paymentMethod: "razorpay",
        paymentId: razorpay_payment_id,
        address: emailAddress,
        items: emailItems,
        orderId: order.id,
      });
    }

    // ── In-app: customer order placed + payment confirmed ────────────────────
    void createNotification({
      userId:    userId,
      role:      "CUSTOMER",
      type:      "ORDER_PLACED",
      title:     `Order Placed — #${order.orderNumber} 🛍️`,
      message:   `Your order for ₹${total.toLocaleString("en-IN")} has been placed successfully!`,
      icon:      "🛍️",
      link:      `/account/orders/${order.id}`,
      priority:  "NORMAL",
      emailSent: !!userEmail,
    });

    void createNotification({
      userId:    userId,
      role:      "CUSTOMER",
      type:      "PAYMENT_SUCCESS",
      title:     "Payment Confirmed ✅",
      message:   `Payment of ₹${total.toLocaleString("en-IN")} for order #${order.orderNumber} received.`,
      icon:      "✅",
      link:      `/account/orders/${order.id}`,
      priority:  "HIGH",
      emailSent: !!userEmail,
    });

    // ── In-app: admin new order ───────────────────────────────────────────────
    void createAdminNotification({
      type:     "ADMIN_NEW_ORDER",
      title:    `New Order: #${order.orderNumber}`,
      message:  `${userName} placed an order for ₹${total.toLocaleString("en-IN")}.`,
      icon:     "📦",
      link:     `/admin/orders/${order.id}`,
      priority: "HIGH",
      metadata: { orderId: order.id, total, customerName: userName },
    });

    void createAdminNotification({
      type:     "ADMIN_PAYMENT_SUCCESS",
      title:    "Payment Received ✅",
      message:  `Payment of ₹${total.toLocaleString("en-IN")} received for order #${order.orderNumber} (${razorpay_payment_id}).`,
      icon:     "💳",
      link:     `/admin/orders/${order.id}`,
      priority: "NORMAL",
    });

    // Low / out-of-stock alerts (check post-transaction stock)
    for (const item of cart.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.product.id },
        select: { name: true, sku: true, stock: true },
      });
      if (!product) continue;

      if (product.stock === 0) {
        sendAdminOutOfStockEmail({
          productName: product.name,
          sku: product.sku,
          productId: item.product.id,
        });
        void createAdminNotification({
          type:     "ADMIN_OUT_OF_STOCK",
          title:    `Out of Stock: ${product.name}`,
          message:  `${product.name} (SKU: ${product.sku}) is now out of stock and needs restocking.`,
          icon:     "🚨",
          link:     "/admin/inventory",
          priority: "URGENT",
          metadata: { productId: item.product.id, sku: product.sku },
        });
      } else if (product.stock <= LOW_STOCK_THRESHOLD) {
        sendAdminLowStockEmail({
          productName: product.name,
          sku: product.sku,
          currentStock: product.stock,
          productId: item.product.id,
        });
        void createAdminNotification({
          type:     "ADMIN_LOW_STOCK",
          title:    `Low Stock: ${product.name}`,
          message:  `${product.name} (SKU: ${product.sku}) has only ${product.stock} unit${product.stock === 1 ? "" : "s"} remaining.`,
          icon:     "⚠️",
          link:     "/admin/inventory",
          priority: "HIGH",
          metadata: { productId: item.product.id, sku: product.sku, stock: product.stock },
        });
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error("Order creation failed after payment:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}

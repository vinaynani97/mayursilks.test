import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendAdminDailySummaryEmail } from "@/lib/email";

// Called by Vercel Cron or external scheduler
// Add CRON_SECRET to env and pass as Bearer token
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [orders, newCustomers] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: today } },
      select: { total: true, status: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: today }, role: "CUSTOMER" },
    }),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;

  sendAdminDailySummaryEmail({
    date: today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    totalOrders: orders.length,
    totalRevenue,
    newCustomers,
    cancelledOrders,
  });

  return NextResponse.json({ success: true, orders: orders.length, revenue: totalRevenue });
}

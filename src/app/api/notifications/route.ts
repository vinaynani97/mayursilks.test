import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/notifications?cursor=<id>&limit=10&unreadOnly=false
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor     = searchParams.get("cursor");
  const limit      = Math.min(parseInt(searchParams.get("limit") ?? "10"), 20);
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const isAdmin = session.user.role === "ADMIN";

  const where = isAdmin
    ? { role: "ADMIN"    as const, ...(unreadOnly && { isRead: false }) }
    : { role: "CUSTOMER" as const, userId: session.user.id, ...(unreadOnly && { isRead: false }) };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    take: limit + 1,
    select: {
      id:        true,
      title:     true,
      message:   true,
      type:      true,
      priority:  true,
      icon:      true,
      link:      true,
      metadata:  true,
      isRead:    true,
      emailSent: true,
      createdAt: true,
    },
  });

  const hasMore    = notifications.length > limit;
  const items      = hasMore ? notifications.slice(0, limit) : notifications;
  const nextCursor = hasMore ? (items[items.length - 1]?.id ?? null) : null;

  return NextResponse.json({ notifications: items, nextCursor, hasMore });
}

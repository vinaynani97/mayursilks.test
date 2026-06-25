import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/notifications/unread-count — lightweight polling endpoint for badge
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const isAdmin = session.user.role === "ADMIN";

  const count = await prisma.notification.count({
    where: isAdmin
      ? { role: "ADMIN", isRead: false }
      : { userId: session.user.id, role: "CUSTOMER", isRead: false },
  });

  return NextResponse.json({ count });
}

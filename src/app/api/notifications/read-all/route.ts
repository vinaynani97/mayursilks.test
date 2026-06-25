import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/notifications/read-all — mark every unread notification as read
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  await prisma.notification.updateMany({
    where: isAdmin
      ? { role: "ADMIN", isRead: false }
      : { userId: session.user.id, role: "CUSTOMER", isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}

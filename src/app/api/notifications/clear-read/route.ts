import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/notifications/clear-read — delete all read notifications
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  await prisma.notification.deleteMany({
    where: isAdmin
      ? { role: "ADMIN", isRead: true }
      : { userId: session.user.id, role: "CUSTOMER", isRead: true },
  });

  return NextResponse.json({ success: true });
}

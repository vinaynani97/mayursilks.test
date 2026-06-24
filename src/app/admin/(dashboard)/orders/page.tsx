import { prisma } from "@/lib/db";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = await prisma.order
    .findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
        address: true,
      },
    })
    .catch(() => []);

  return <AdminOrdersClient orders={orders} />;
}

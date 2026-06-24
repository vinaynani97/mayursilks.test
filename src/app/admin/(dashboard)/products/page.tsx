import { prisma } from "@/lib/db";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product
      .findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []),
    prisma.category
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
  ]);

  return <AdminProductsClient products={products} categories={categories} />;
}

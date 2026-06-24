import { prisma } from "@/lib/db";
import AdminCategoriesClient from "./AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category
    .findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);

  return <AdminCategoriesClient categories={categories} />;
}

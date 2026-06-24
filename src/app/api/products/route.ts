import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    const mapped = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      images: p.images,
      category: p.category.name,
      categorySlug: p.category.slug,
      fabric: p.fabric,
      weavingTechnique: p.weavingTechnique,
      designDetails: p.designDetails,
      length: p.length,
      color: p.color,
      availability: p.availability.toLowerCase(),
      stock: p.stock,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      isFeatured: p.isFeatured,
      rating: 4.8,
      reviewCount: 0,
      tags: p.tags,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json({ products: mapped });
  } catch {
    return NextResponse.json({ products: [] });
  }
}

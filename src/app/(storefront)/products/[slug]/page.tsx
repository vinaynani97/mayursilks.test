import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductDetailClient from "./ProductDetailClient";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { name: true, description: true } }).catch(() => null);
  if (!product) return { title: "Product Not Found" };
  return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      reviews: { where: { isApproved: true }, include: { user: { select: { name: true } } } },
    },
  }).catch(() => null);

  if (!product) return notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
    include: { category: true },
  }).catch(() => []);

  const mapped = {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images,
    category: product.category.name,
    categorySlug: product.category.slug,
    fabric: product.fabric,
    weavingTechnique: product.weavingTechnique,
    designDetails: product.designDetails,
    length: product.length,
    color: product.color,
    availability: product.availability.toLowerCase() as "in_stock" | "out_of_stock" | "made_to_order",
    stock: product.stock,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    rating: product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 4.8,
    reviewCount: product.reviews.length,
    tags: product.tags,
    createdAt: product.createdAt.toISOString(),
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      author: r.user.name,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  const mappedRelated = related.map((p) => ({
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
    availability: p.availability.toLowerCase() as "in_stock" | "out_of_stock" | "made_to_order",
    stock: p.stock,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
    rating: 4.8,
    reviewCount: 0,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
  }));

  return <ProductDetailClient product={mapped} related={mappedRelated} />;
}

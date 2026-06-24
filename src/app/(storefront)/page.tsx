import { prisma } from "@/lib/db";
import HeroSection from "@/components/storefront/HeroSection";
import TrustSection from "@/components/storefront/TrustSection";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import FeaturedProducts from "@/components/storefront/FeaturedProducts";
import OurStory from "@/components/storefront/OurStory";
import Testimonials from "@/components/storefront/Testimonials";
import BlogSection from "@/components/storefront/BlogSection";
import Newsletter from "@/components/storefront/Newsletter";

export default async function HomePage() {
  const [categories, products, blogs] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }).catch(() => []),
    prisma.product.findMany({
      where: { OR: [{ isNew: true }, { isBestSeller: true }, { isFeatured: true }] },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }).catch(() => []),
    prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }).catch(() => []),
  ]);

  // Map DB products to the shape components expect
  const mappedProducts = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
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

  const mappedCategories = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    image: c.image,
    productCount: c._count.products,
  }));

  const mappedBlogs = blogs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt,
    content: b.content,
    coverImage: b.coverImage,
    author: b.author,
    isPublished: b.isPublished,
    tags: b.tags,
    readingTime: b.readingTime,
    publishedAt: b.createdAt.toISOString(),
  }));

  return (
    <>
      <HeroSection />
      <TrustSection />
      <CategoryGrid categories={mappedCategories} />
      <FeaturedProducts products={mappedProducts} />
      <OurStory />
      <Testimonials />
      <BlogSection blogs={mappedBlogs} />
      <Newsletter />
    </>
  );
}

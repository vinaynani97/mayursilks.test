import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import WishlistClient from "./WishlistClient";
import type { Product } from "@/types";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const products: Product[] = wishlistItems.map(({ product: p }) => ({
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
    availability: p.availability.toLowerCase() as Product["availability"],
    stock: p.stock,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
    rating: 4.8,
    reviewCount: 0,
    tags: p.tags,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-luxury-gradient py-10 px-4 text-center">
        <h1 className="font-josefin text-3xl font-light text-white">My Wishlist</h1>
        <p className="font-jost text-white/70 mt-2">
          {products.length} {products.length === 1 ? "saree" : "sarees"} saved
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <WishlistClient initialProducts={products} />
      </div>
    </div>
  );
}

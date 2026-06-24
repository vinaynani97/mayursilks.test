import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, getCloudinaryUrl } from "@/lib/utils";

export default async function AccountWishlistPage() {
  const session = await auth();
  if (!session) return null;

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: { category: { select: { name: true } } },
      },
    },
  }).catch(() => []);

  return (
    <div>
      <h1 className="font-josefin text-2xl font-bold text-gray-900 mb-6">
        Wishlist <span className="text-gray-400 font-normal text-lg">({wishlist.length})</span>
      </h1>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-josefin text-xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h3>
          <p className="font-jost text-gray-400 mb-6">Save items you love to buy them later.</p>
          <Link
            href="/products"
            className="inline-block bg-primary-500 text-white px-6 py-3 rounded-xl font-jost font-medium hover:bg-primary-600 transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map(({ product }) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-[3/4] relative bg-primary-50">
                {product.images[0] ? (
                  <Image
                    src={getCloudinaryUrl(product.images[0], 400, 500)}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-primary-200" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-jost text-xs text-gray-400 uppercase tracking-wide mb-0.5">{product.category.name}</p>
                <p className="font-jost text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                <p className="font-josefin font-bold text-primary-500 mt-1">{formatPrice(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

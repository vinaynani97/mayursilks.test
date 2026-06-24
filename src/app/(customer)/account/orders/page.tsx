import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatDate, getCloudinaryUrl } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  PLACED: { label: "Order Placed", className: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-100 text-indigo-700" },
  PACKED: { label: "Packed", className: "bg-yellow-100 text-yellow-700" },
  SHIPPED: { label: "Shipped", className: "bg-orange-100 text-orange-700" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", className: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  RETURNED: { label: "Returned", className: "bg-gray-100 text-gray-700" },
};

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        take: 2,
        include: { product: { select: { images: true, slug: true } } },
      },
      address: { select: { city: true, state: true } },
    },
  }).catch(() => []);

  return (
    <div>
      <h1 className="font-josefin text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-josefin text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="font-jost text-gray-400 mb-6">Explore our collection and place your first order!</p>
          <Link
            href="/products"
            className="inline-block bg-primary-500 text-white px-6 py-3 rounded-xl font-jost font-medium hover:bg-primary-600 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const sc = statusConfig[order.status] ?? statusConfig.PLACED;
            const totalItems = order.items.reduce((s) => s + 1, 0);
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow block group"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="font-jost text-xs text-gray-400 mt-0.5">
                        {formatDate(order.createdAt.toISOString())} · {order.address.city}, {order.address.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-josefin font-bold text-gray-900 text-base">{formatPrice(order.total)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-jost font-medium ${sc.className}`}>
                      {sc.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </div>

                {/* Item Thumbnails */}
                <div className="px-6 py-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="w-12 h-14 rounded-lg overflow-hidden border-2 border-white bg-primary-50 relative flex-shrink-0"
                      >
                        {item.product.images[0] ? (
                          <Image
                            src={getCloudinaryUrl(item.product.images[0], 96, 112)}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary-200" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-jost text-sm text-gray-700 line-clamp-1">
                      {order.items[0]?.name}
                      {totalItems > 1 ? ` +${totalItems - 1} more` : ""}
                    </p>
                    <p className="font-jost text-xs text-primary-500 mt-0.5 group-hover:underline">
                      View Details →
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

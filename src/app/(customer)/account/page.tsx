import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, Heart, MapPin, Package } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  PLACED: { label: "Placed", className: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-100 text-indigo-700" },
  PACKED: { label: "Packed", className: "bg-yellow-100 text-yellow-700" },
  SHIPPED: { label: "Shipped", className: "bg-orange-100 text-orange-700" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", className: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  RETURNED: { label: "Returned", className: "bg-gray-100 text-gray-700" },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session) return null;

  const userId = session.user.id;

  const [orders, wishlistCount, addressCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: { select: { quantity: true } } },
    }).catch(() => []),
    prisma.wishlistItem.count({ where: { userId } }).catch(() => 0),
    prisma.address.count({ where: { userId } }).catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-josefin text-2xl font-bold text-gray-900">My Account</h1>
        <p className="font-jost text-sm text-gray-500 mt-1">Welcome back, {session.user.name}!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag, href: "/account/orders", color: "bg-blue-50 text-blue-600" },
          { label: "Wishlist Items", value: wishlistCount, icon: Heart, href: "/account/wishlist", color: "bg-pink-50 text-pink-600" },
          { label: "Saved Addresses", value: addressCount, icon: MapPin, href: "/account/addresses", color: "bg-purple-50 text-purple-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-josefin text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="font-jost text-sm text-gray-500">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-josefin font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/account/orders" className="font-jost text-sm text-primary-500 hover:text-primary-700">
            View all
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-jost text-gray-400 text-sm mb-4">No orders yet</p>
            <Link
              href="/products"
              className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-xl font-jost text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const sc = statusConfig[order.status] ?? statusConfig.PLACED;
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-gray-700 font-medium">{order.orderNumber}</p>
                    <p className="font-jost text-xs text-gray-400">
                      {itemCount} item{itemCount !== 1 ? "s" : ""} · {formatDate(order.createdAt.toISOString())}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-josefin font-bold text-gray-900">{formatPrice(order.total)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium ${sc.className}`}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

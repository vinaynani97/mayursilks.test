import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      recentOrders,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.order.count({ where: { status: "PLACED" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.product.findMany({
        where: { stock: { lte: 3 }, availability: "IN_STOCK" },
        take: 5,
        select: { id: true, name: true, stock: true, sku: true },
      }),
    ]);
    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalCustomers,
      totalProducts,
      recentOrders,
      pendingOrders,
      deliveredOrders,
      lowStockProducts,
    };
  } catch {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      recentOrders: [],
      pendingOrders: 0,
      deliveredOrders: 0,
      lowStockProducts: [],
    };
  }
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PLACED: { label: "Placed", className: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-100 text-indigo-700" },
  PACKED: { label: "Packed", className: "bg-yellow-100 text-yellow-700" },
  SHIPPED: { label: "Shipped", className: "bg-orange-100 text-orange-700" },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "bg-purple-100 text-purple-700",
  },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  RETURNED: { label: "Returned", className: "bg-gray-100 text-gray-700" },
};

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const statCards = [
    {
      title: "Total Revenue",
      value: formatPrice(data.totalRevenue),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      sub: `${data.deliveredOrders} orders delivered`,
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toString(),
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      sub: `${data.pendingOrders} pending`,
    },
    {
      title: "Customers",
      value: data.totalCustomers.toString(),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      sub: "Registered users",
    },
    {
      title: "Products",
      value: data.totalProducts.toString(),
      icon: Package,
      color: "bg-orange-50 text-orange-600",
      sub: `${data.lowStockProducts.length} low stock`,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="font-jost text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-josefin text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="font-jost text-sm text-gray-500">
                {card.title}
              </div>
              <div className="font-jost text-xs text-gray-400 mt-1">
                {card.sub}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-josefin font-semibold text-gray-900">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="font-jost text-sm text-primary-500 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="w-10 h-10 text-gray-200 mb-3" />
              <p className="font-jost text-sm text-gray-400">
                No orders yet. Share your store!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Order", "Customer", "Items", "Total", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentOrders.map((order) => {
                    const sc =
                      statusConfig[order.status] ?? statusConfig.PLACED;
                    const itemCount = order.items.reduce(
                      (s, i) => s + i.quantity,
                      0,
                    );
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-jost text-sm font-medium text-gray-900">
                            {order.user.name}
                          </p>
                          <p className="font-jost text-xs text-gray-400">
                            {order.user.email}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-jost text-sm text-gray-500">
                          {itemCount}
                        </td>
                        <td className="px-4 py-3 font-jost text-sm font-semibold text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium ${sc.className}`}
                          >
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-josefin font-semibold text-gray-900 mb-4">
              Order Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-jost text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-blue-400" /> Pending
                </div>
                <span className="font-jost text-sm font-semibold">
                  {data.pendingOrders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-jost text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Delivered
                </div>
                <span className="font-jost text-sm font-semibold">
                  {data.deliveredOrders}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-josefin font-semibold text-gray-900 mb-4">
              Low Stock Alert
            </h2>
            {data.lowStockProducts.length === 0 ? (
              <p className="font-jost text-sm text-gray-400">
                All products well stocked
              </p>
            ) : (
              <div className="space-y-3">
                {data.lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="font-jost text-sm text-gray-800 line-clamp-1 flex-1 mr-2">
                      {p.name}
                    </p>
                    <span
                      className={`font-jost text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${p.stock === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}
                    >
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-josefin font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-1">
              {[
                { label: "Add New Product", href: "/admin/products" },
                { label: "Add New Blog", href: "/admin/blogs" },
                { label: "Create Coupon", href: "/admin/coupons" },
                { label: "View All Orders", href: "/admin/orders" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg font-jost text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, MapPin, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Order Confirmed" };

const statusConfig: Record<string, { label: string; className: string }> = {
  PLACED: { label: "Order Placed", className: "bg-blue-100 text-blue-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-100 text-indigo-700" },
  PACKED: { label: "Packed", className: "bg-yellow-100 text-yellow-700" },
  SHIPPED: { label: "Shipped", className: "bg-orange-100 text-orange-700" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", className: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) redirect("/");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      address: true,
    },
  });

  if (!order || order.userId !== session.user.id) redirect("/account/orders");

  const sc = statusConfig[order.status] ?? statusConfig.PLACED;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="font-josefin text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="font-jost text-gray-500 text-sm">
          Thank you for your purchase. We&apos;re preparing your order.
        </p>
      </div>

      {/* Order Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Order Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <p className="font-mono text-sm font-bold text-gray-900">{order.orderNumber}</p>
            <p className="font-jost text-xs text-gray-400 mt-1">
              Placed on {formatDate(order.createdAt.toISOString())}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-jost font-medium ${sc.className}`}>
            {sc.label}
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 text-primary-300" />
                </div>
                <div>
                  <p className="font-jost text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="font-jost text-xs text-gray-400">Qty {item.quantity}</p>
                </div>
              </div>
              <p className="font-josefin font-bold text-sm text-primary-500">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between font-josefin font-bold text-gray-900">
          <span>Total Paid</span>
          <span className="text-primary-500">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-400" />
          <h3 className="font-josefin font-semibold text-gray-900">Delivery To</h3>
        </div>
        <p className="font-jost text-sm font-medium text-gray-900">{order.address.name}</p>
        <p className="font-jost text-xs text-gray-500 mt-0.5">{order.address.phone}</p>
        <p className="font-jost text-xs text-gray-500 mt-1">
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}
        </p>
        <p className="font-jost text-xs text-gray-500">
          {order.address.city}, {order.address.state} — {order.address.pincode}
        </p>
      </div>

      {/* Payment Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-4 h-4 text-gray-400" />
          <h3 className="font-josefin font-semibold text-gray-900">Payment Details</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-jost">
            <span className="text-gray-500">Method</span>
            <span className="text-gray-900 capitalize font-medium">{order.paymentMethod}</span>
          </div>
          {order.paymentId && (
            <div className="flex justify-between text-sm font-jost">
              <span className="text-gray-500">Payment ID</span>
              <span className="font-mono text-xs text-gray-700">{order.paymentId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-jost font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          <Package className="w-4 h-4" /> Track Order
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-jost font-medium py-3.5 rounded-xl transition-colors text-sm"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

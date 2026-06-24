import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, User, MapPin, CreditCard, Package, ShoppingBag } from "lucide-react";
import { formatPrice, formatDate, getCloudinaryUrl } from "@/lib/utils";
import AdminOrderStatusForm from "./AdminOrderStatusForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Admin · Order ${id.slice(-8).toUpperCase()}` };
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session || (session.user as { role?: string }).role !== "ADMIN") redirect("/admin/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
      items: {
        include: { product: { select: { images: true, slug: true, stock: true } } },
      },
      address: true,
    },
  });

  if (!order) notFound();

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

  const sc = statusConfig[order.status] ?? statusConfig.PLACED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="font-josefin text-xl font-bold text-gray-900 font-mono">
              {order.orderNumber}
            </h1>
            <p className="font-jost text-xs text-gray-400">
              {formatDate(order.createdAt.toISOString())}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-jost font-medium ${sc.className}`}>
          {sc.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-josefin font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 px-6 py-4">
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0 relative">
                    {item.product.images[0] ? (
                      <Image
                        src={getCloudinaryUrl(item.product.images[0], 128, 160)}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary-200" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.slug}`}
                      target="_blank"
                      className="font-jost text-sm font-medium text-gray-900 hover:text-primary-500 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="font-jost text-xs text-gray-400">Qty: {item.quantity}</span>
                      <span className="font-jost text-xs text-gray-400">Unit: {formatPrice(item.price)}</span>
                      <span className="font-jost text-xs text-gray-400">
                        Current stock: {item.product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-josefin font-bold text-primary-500">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-2">
              <div className="flex justify-between text-sm font-jost text-gray-600">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-jost text-green-600">
                <span>Shipping</span><span>FREE</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm font-jost text-green-600">
                  <span>Discount</span><span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-josefin font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-500">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <AdminOrderStatusForm orderId={order.id} currentStatus={order.status} />

          {/* Notes */}
          {order.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="font-jost text-xs font-semibold text-amber-700 mb-1">Customer Notes</p>
              <p className="font-jost text-sm text-amber-800">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Customer + Payment + Address */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-400" />
              <h3 className="font-josefin font-semibold text-gray-900">Customer</h3>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="font-josefin font-bold text-primary-500 text-sm">
                  {order.user.name[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-jost text-sm font-semibold text-gray-900">{order.user.name}</p>
                <p className="font-jost text-xs text-gray-400">Since {formatDate(order.user.createdAt.toISOString())}</p>
              </div>
            </div>
            {order.user.email && (
              <a href={`mailto:${order.user.email}`} className="font-jost text-xs text-primary-500 hover:underline block mb-1">
                {order.user.email}
              </a>
            )}
            {order.user.phone && (
              <a href={`tel:${order.user.phone}`} className="font-jost text-xs text-gray-500 block">
                {order.user.phone}
              </a>
            )}
            <Link
              href={`/admin/customers?id=${order.user.id}`}
              className="mt-3 text-xs font-jost text-primary-500 hover:underline"
            >
              View customer profile →
            </Link>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h3 className="font-josefin font-semibold text-gray-900">Payment</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-jost">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900 capitalize font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs font-jost">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Paid</span>
              </div>
              {order.paymentId && (
                <div className="text-xs font-jost">
                  <span className="text-gray-500 block mb-0.5">Payment ID</span>
                  <span className="font-mono text-gray-700 break-all">{order.paymentId}</span>
                </div>
              )}
              {order.razorpayOrderId && (
                <div className="text-xs font-jost">
                  <span className="text-gray-500 block mb-0.5">Razorpay Order ID</span>
                  <span className="font-mono text-gray-700 break-all">{order.razorpayOrderId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h3 className="font-josefin font-semibold text-gray-900">Ship To</h3>
            </div>
            <p className="font-jost text-sm font-semibold text-gray-900">{order.address.name}</p>
            <p className="font-jost text-xs text-gray-500 mt-0.5">{order.address.phone}</p>
            <p className="font-jost text-xs text-gray-500 mt-1">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
            </p>
            <p className="font-jost text-xs text-gray-500">
              {order.address.city}, {order.address.state} — {order.address.pincode}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-josefin font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {order.user.phone && (
                <a
                  href={`https://wa.me/91${order.user.phone}?text=Hi%20${encodeURIComponent(order.user.name)}%2C%20your%20Mayur%20Silks%20order%20${order.orderNumber}%20has%20been%20updated.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl font-jost text-sm transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Notify via WhatsApp
                </a>
              )}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-primary-50 text-primary-700 rounded-xl font-jost text-sm">
                <Package className="w-4 h-4" />
                {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {formatPrice(order.total)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Package, MapPin, CreditCard, CheckCircle,
  Clock, Truck, Home, ShoppingBag, XCircle,
} from "lucide-react";
import { formatPrice, formatDate, getCloudinaryUrl } from "@/lib/utils";
import InvoiceButton from "./InvoiceButton";
import CancelOrderButton from "./CancelOrderButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Order Details — ${id.slice(-8).toUpperCase()}` };
}

const STATUS_TIMELINE = [
  { key: "PLACED",           label: "Order Placed",      icon: CheckCircle, desc: "Payment received, order confirmed" },
  { key: "CONFIRMED",        label: "Confirmed",         icon: Clock,        desc: "Order confirmed by our team" },
  { key: "PACKED",           label: "Packed",            icon: Package,      desc: "Your order has been carefully packed" },
  { key: "SHIPPED",          label: "Shipped",           icon: Truck,        desc: "On the way to you" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",  icon: Truck,        desc: "Arriving today" },
  { key: "DELIVERED",        label: "Delivered",         icon: Home,         desc: "Package delivered successfully" },
];

const STATUS_ORDER = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account/orders");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { select: { images: true, slug: true } } },
      },
      address: true,
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const sc = statusConfig[order.status] ?? statusConfig.PLACED;
  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "RETURNED";
  const canCancel = order.status === "PLACED";

  return (
    <>
      {/* Print-only header */}
      <div className="hidden print:block mb-8">
        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">MAYUR SILKS</h1>
            <p className="text-sm text-gray-600">Pure Handloom Heritage</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">INVOICE</p>
            <p className="text-sm">{order.orderNumber}</p>
            <p className="text-sm text-gray-600">{formatDate(order.createdAt.toISOString())}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="print:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/account/orders" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </Link>
            <div>
              <h1 className="font-josefin text-xl font-bold text-gray-900 font-mono">{order.orderNumber}</h1>
              <p className="font-jost text-xs text-gray-400">{formatDate(order.createdAt.toISOString())}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InvoiceButton />
            {canCancel && <CancelOrderButton orderId={order.id} />}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 print:hidden">
          <span className={`px-3 py-1.5 rounded-full text-sm font-jost font-medium ${sc.className}`}>
            {sc.label}
          </span>
          {order.paymentId && (
            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {order.paymentId.slice(0, 20)}...
            </span>
          )}
        </div>

        {/* Tracking Timeline (hidden for cancelled) */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:border print:rounded-none">
            <h2 className="font-josefin font-semibold text-gray-900 mb-6">Order Tracking</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div
                className="absolute left-4 top-0 w-0.5 bg-primary-500 transition-all duration-700"
                style={{ height: `${currentIdx >= 0 ? (currentIdx / (STATUS_TIMELINE.length - 1)) * 100 : 0}%` }}
              />

              <div className="space-y-6">
                {STATUS_TIMELINE.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentIdx;
                  const active = idx === currentIdx;
                  return (
                    <div key={step.key} className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        done ? "bg-primary-500 border-primary-500" : "bg-white border-gray-200"
                      }`}>
                        <Icon className={`w-4 h-4 ${done ? "text-white" : "text-gray-300"}`} />
                      </div>
                      <div className={`flex-1 pt-1 ${done ? "" : "opacity-40"}`}>
                        <p className={`font-jost text-sm font-semibold ${active ? "text-primary-500" : done ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        <p className="font-jost text-xs text-gray-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-jost text-sm font-semibold text-red-700">Order {order.status === "RETURNED" ? "Returned" : "Cancelled"}</p>
              <p className="font-jost text-xs text-red-500 mt-0.5">Stock has been restored. Refund will be credited within 5–7 business days.</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border print:rounded-none">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-josefin font-semibold text-gray-900">Items Ordered</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 px-6 py-4">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0 relative print:hidden">
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
                      <ShoppingBag className="w-6 h-6 text-primary-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-jost text-sm font-medium text-gray-900 hover:text-primary-500 transition-colors line-clamp-2 print:text-black"
                  >
                    {item.name}
                  </Link>
                  <p className="font-jost text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                  <p className="font-jost text-xs text-gray-400">Unit Price: {formatPrice(item.price)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-josefin font-bold text-primary-500">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-2 print:bg-white">
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

        {/* Address + Payment row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:border print:rounded-none">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gray-400" />
              <h3 className="font-josefin font-semibold text-gray-900">Delivery Address</h3>
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 print:border print:rounded-none">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <h3 className="font-josefin font-semibold text-gray-900">Payment Info</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-jost">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900 capitalize font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-jost">
                <span className="text-gray-500">Status</span>
                <span className="text-green-600 font-medium">Paid</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between text-xs font-jost">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-gray-600 truncate max-w-[140px]">{order.paymentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 print:border print:rounded-none">
            <p className="font-jost text-xs font-semibold text-amber-700 mb-1">Order Notes</p>
            <p className="font-jost text-sm text-amber-800">{order.notes}</p>
          </div>
        )}

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-gray-500 pt-8 border-t">
          <p>Thank you for shopping with Mayur Silks!</p>
          <p>For any queries, WhatsApp us at +91 96528 03383</p>
          <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>
    </>
  );
}

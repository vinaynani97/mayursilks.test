"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { updateOrderStatus } from "@/actions/orders";

const ORDER_STATUSES = [
  "PLACED", "CONFIRMED", "PACKED", "SHIPPED",
  "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED",
];

const statusConfig: Record<string, { label: string; className: string }> = {
  PLACED:           { label: "Order Placed",    className: "bg-blue-100 text-blue-700" },
  CONFIRMED:        { label: "Confirmed",        className: "bg-indigo-100 text-indigo-700" },
  PACKED:           { label: "Packed",           className: "bg-yellow-100 text-yellow-700" },
  SHIPPED:          { label: "Shipped",          className: "bg-orange-100 text-orange-700" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", className: "bg-purple-100 text-purple-700" },
  DELIVERED:        { label: "Delivered",        className: "bg-green-100 text-green-700" },
  CANCELLED:        { label: "Cancelled",        className: "bg-red-100 text-red-700" },
  RETURNED:         { label: "Returned",         className: "bg-gray-100 text-gray-700" },
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  user: { name: string; email: string | null };
  items: { quantity: number; product: { name: string } }[];
  address: { name: string; city: string; state: string; pincode: string };
};

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.orderNumber.includes(search) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.user.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleStatusChange(orderId: string, status: string) {
    startTransition(async () => {
      await updateOrderStatus(orderId, status);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">Orders</h1>
        <p className="font-jost text-sm text-gray-500 mt-1">{orders.length} total orders</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search by order #, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm font-jost focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 text-sm font-jost border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
        >
          <option value="all">All Status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{statusConfig[s]?.label ?? s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Order #", "Customer", "Items", "Total", "Payment", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 font-jost text-gray-400">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const sc = statusConfig[order.status] ?? statusConfig.PLACED;
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-jost text-sm font-medium text-gray-900">{order.user.name}</p>
                        <p className="font-jost text-xs text-gray-400">{order.user.email}</p>
                      </td>
                      <td className="px-4 py-3 font-jost text-sm text-gray-500">{itemCount}</td>
                      <td className="px-4 py-3 font-jost text-sm font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3 font-jost text-xs text-gray-500 capitalize">
                        {order.paymentMethod}
                      </td>
                      <td className="px-4 py-3 font-jost text-xs text-gray-500">
                        {formatDate(order.createdAt.toISOString())}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium ${sc.className}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={isPending}
                              className="h-8 pl-2 pr-6 text-xs font-jost border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500/30 appearance-none"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>{statusConfig[s]?.label ?? s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs font-jost text-primary-500 hover:text-primary-700 whitespace-nowrap"
                          >
                            Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { updateOrderStatus } from "@/actions/orders";

const ORDER_STATUSES = [
  { value: "PLACED",           label: "Order Placed" },
  { value: "CONFIRMED",        label: "Confirmed" },
  { value: "PACKED",           label: "Packed" },
  { value: "SHIPPED",          label: "Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED",        label: "Delivered" },
  { value: "CANCELLED",        label: "Cancelled" },
  { value: "RETURNED",         label: "Returned" },
];

const INPUT_CLASS =
  "w-full h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white";

export default function AdminOrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierPartner, setCourierPartner] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isShipping = status === "SHIPPED" && status !== currentStatus;
  const isCancelling = status === "CANCELLED" && status !== currentStatus;
  const isReturning = status === "RETURNED" && status !== currentStatus;

  function handleUpdate() {
    if (status === currentStatus) return;
    startTransition(async () => {
      await updateOrderStatus(orderId, status, {
        trackingNumber: trackingNumber.trim() || undefined,
        courierPartner: courierPartner.trim() || undefined,
        cancellationReason: cancellationReason.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-josefin font-semibold text-gray-900 mb-4">Update Order Status</h2>

      <div className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setSaved(false);
              setTrackingNumber("");
              setCourierPartner("");
              setCancellationReason("");
            }}
            disabled={isPending}
            className="h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white flex-1 min-w-40"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={handleUpdate}
            disabled={isPending || status === currentStatus}
            className="flex items-center gap-2 px-5 h-10 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-jost text-sm font-medium rounded-xl transition-colors"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> Updated!</>
            ) : (
              "Update Status"
            )}
          </button>
        </div>

        {isShipping && (
          <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-xl space-y-3">
            <p className="font-jost text-xs font-semibold text-cyan-700 uppercase tracking-wide">
              🚚 Shipment Details (sent to customer)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-jost text-xs font-medium text-gray-600 mb-1">
                  Tracking Number
                </label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className="block font-jost text-xs font-medium text-gray-600 mb-1">
                  Courier Partner
                </label>
                <input
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  placeholder="e.g. Delhivery, Blue Dart"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        )}

        {isCancelling && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2">
            <p className="font-jost text-xs font-semibold text-red-700 uppercase tracking-wide">
              ❌ Cancellation Details
            </p>
            <input
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Reason for cancellation (optional — sent to customer)"
              className={INPUT_CLASS}
            />
            <p className="font-jost text-xs text-red-500">
              ⚠ Cancelling will restore stock for all items in this order.
            </p>
          </div>
        )}

        {isReturning && (
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
            <p className="font-jost text-xs text-purple-700">
              🔄 Marking as <strong>Returned</strong> will automatically send a <strong>Refund Processed</strong> email to the customer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

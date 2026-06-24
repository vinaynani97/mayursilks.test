"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { cancelOrder } from "@/actions/orders";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancel() {
    startTransition(async () => {
      await cancelOrder(orderId);
      router.refresh();
    });
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-jost text-xs text-gray-500">Cancel this order?</span>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-jost text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
          Yes, Cancel
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="font-jost text-xs text-gray-500 hover:text-gray-700"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-jost text-sm font-medium rounded-xl transition-colors"
    >
      <XCircle className="w-4 h-4" />
      Cancel Order
    </button>
  );
}

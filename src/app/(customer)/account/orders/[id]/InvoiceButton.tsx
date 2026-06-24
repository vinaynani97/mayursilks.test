"use client";

import { Printer } from "lucide-react";

export default function InvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-jost text-sm font-medium rounded-xl transition-colors"
    >
      <Printer className="w-4 h-4" />
      Download Invoice
    </button>
  );
}

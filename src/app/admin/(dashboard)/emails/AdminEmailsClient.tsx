"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail, Search, RefreshCw, Send, CheckCircle2, XCircle,
  Clock, Filter, RotateCcw, TrendingUp, Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { resendFailedEmail } from "@/actions/emails";
import type { EmailLogRow, EmailStats } from "@/actions/emails";
import type { EmailType, EmailStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<EmailType, string> = {
  WELCOME: "Welcome",
  ORDER_CONFIRMATION: "Order Confirmation",
  PAYMENT_SUCCESS: "Payment Success",
  ORDER_CONFIRMED: "Order Confirmed",
  ORDER_PACKED: "Order Packed",
  ORDER_SHIPPED: "Order Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  ORDER_DELIVERED: "Order Delivered",
  ORDER_CANCELLED: "Order Cancelled",
  REFUND_PROCESSED: "Refund Processed",
  ADMIN_NEW_ORDER: "New Order Alert",
  ADMIN_LOW_STOCK: "Low Stock Alert",
  ADMIN_OUT_OF_STOCK: "Out of Stock Alert",
  ADMIN_DAILY_SUMMARY: "Daily Summary",
  ADMIN_PAYMENT_FAILED: "Payment Failed Alert",
};

const TYPE_COLORS: Record<EmailType, string> = {
  WELCOME: "bg-purple-50 text-purple-700 border-purple-100",
  ORDER_CONFIRMATION: "bg-blue-50 text-blue-700 border-blue-100",
  PAYMENT_SUCCESS: "bg-green-50 text-green-700 border-green-100",
  ORDER_CONFIRMED: "bg-blue-50 text-blue-600 border-blue-100",
  ORDER_PACKED: "bg-violet-50 text-violet-700 border-violet-100",
  ORDER_SHIPPED: "bg-cyan-50 text-cyan-700 border-cyan-100",
  OUT_FOR_DELIVERY: "bg-amber-50 text-amber-700 border-amber-100",
  ORDER_DELIVERED: "bg-green-50 text-green-700 border-green-100",
  ORDER_CANCELLED: "bg-red-50 text-red-700 border-red-100",
  REFUND_PROCESSED: "bg-teal-50 text-teal-700 border-teal-100",
  ADMIN_NEW_ORDER: "bg-primary-50 text-primary-700 border-primary-100",
  ADMIN_LOW_STOCK: "bg-orange-50 text-orange-700 border-orange-100",
  ADMIN_OUT_OF_STOCK: "bg-red-50 text-red-800 border-red-200",
  ADMIN_DAILY_SUMMARY: "bg-gray-50 text-gray-700 border-gray-100",
  ADMIN_PAYMENT_FAILED: "bg-rose-50 text-rose-700 border-rose-100",
};

function StatusBadge({ status }: { status: EmailStatus }) {
  if (status === "SENT")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-jost font-medium bg-green-50 text-green-700 border border-green-100">
        <CheckCircle2 className="w-3 h-3" /> Sent
      </span>
    );
  if (status === "FAILED")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-jost font-medium bg-red-50 text-red-700 border border-red-100">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-jost font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function AdminEmailsClient({
  initialLogs,
  stats,
}: {
  initialLogs: EmailLogRow[];
  stats: EmailStats;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<EmailType | "">("");
  const [filterStatus, setFilterStatus] = useState<EmailStatus | "">("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return initialLogs.filter((log) => {
      const matchSearch =
        !search ||
        log.email.toLowerCase().includes(search.toLowerCase()) ||
        log.subject.toLowerCase().includes(search.toLowerCase());
      const matchType = !filterType || log.type === filterType;
      const matchStatus = !filterStatus || log.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [initialLogs, search, filterType, filterStatus]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleResend(logId: string) {
    setResendingId(logId);
    const result = await resendFailedEmail(logId);
    setResendingId(null);
    showToast(result.message, result.success);
    if (result.success) startTransition(() => router.refresh());
  }

  const statCards = [
    {
      label: "Total Emails",
      value: stats.total,
      icon: Send,
      color: "text-primary-500",
      bg: "bg-primary-50",
    },
    {
      label: "Sent Today",
      value: stats.today,
      icon: Mail,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Failed",
      value: stats.failed,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-josefin text-2xl font-bold text-gray-900">Email Center</h1>
          <p className="font-jost text-sm text-gray-500 mt-1">
            Monitor all email notifications sent from Mayur Silks
          </p>
        </div>
        <button
          onClick={() => startTransition(() => router.refresh())}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-jost text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-4.5 h-4.5", color)} />
            </div>
            <p className="font-josefin text-2xl font-bold text-gray-900">{value}</p>
            <p className="font-jost text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Most Popular Email Type */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-50">
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-jost text-xs text-gray-500">Most Sent Email Type</p>
            {stats.mostSentType ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "inline-block px-2.5 py-0.5 rounded-full text-xs font-jost font-semibold border",
                  TYPE_COLORS[stats.mostSentType]
                )}>
                  {TYPE_LABELS[stats.mostSentType]}
                </span>
                <span className="font-jost text-xs text-gray-400">
                  — {initialLogs.filter(l => l.type === stats.mostSentType).length} in view
                </span>
              </div>
            ) : (
              <p className="font-josefin text-sm font-semibold text-gray-400 mt-0.5">No emails sent yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or subject…"
              className="w-full pl-9 pr-4 h-10 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EmailType | "")}
              className="h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white"
            >
              <option value="">All Types</option>
              {(Object.keys(TYPE_LABELS) as EmailType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EmailStatus | "")}
              className="h-10 px-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-gray-300" />
            </div>
            <p className="font-josefin text-gray-900 font-semibold">No emails found</p>
            <p className="font-jost text-sm text-gray-400 mt-1">
              {search || filterType || filterStatus
                ? "Try adjusting your filters"
                : "Email logs will appear here once emails are sent"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Recipient</th>
                  <th className="text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Subject</th>
                  <th className="text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Type</th>
                  <th className="text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {filtered.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-jost text-sm font-medium text-gray-900">{log.email}</p>
                        {log.user?.name && (
                          <p className="font-jost text-xs text-gray-400">{log.user.name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="font-jost text-sm text-gray-600 truncate">{log.subject}</p>
                        {log.errorMessage && (
                          <p className="font-jost text-xs text-red-500 truncate mt-0.5">{log.errorMessage}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "inline-block px-2 py-0.5 rounded-full text-xs font-jost font-medium border",
                          TYPE_COLORS[log.type]
                        )}>
                          {TYPE_LABELS[log.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-jost text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                        <p className="font-jost text-xs text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        {log.status === "FAILED" && (
                          <button
                            onClick={() => handleResend(log.id)}
                            disabled={resendingId === log.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-jost font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className={cn("w-3 h-3", resendingId === log.id && "animate-spin")} />
                            Resend
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="font-jost text-xs text-gray-400">
            Showing {filtered.length} of {initialLogs.length} email logs
          </p>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg font-jost text-sm font-medium z-50",
              toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"
            )}
          >
            {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

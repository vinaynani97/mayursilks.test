import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Mail, Trash2 } from "lucide-react";
import { deleteSubscriber } from "@/actions/newsletter";
import { revalidatePath } from "next/cache";

async function handleDelete(id: string) {
  "use server";
  await deleteSubscriber(id);
  revalidatePath("/admin/newsletter");
}

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber
    .findMany({
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">
          Newsletter
        </h1>
        <p className="font-jost text-sm text-gray-500 mt-1">
          {subscribers.length} subscribers ({activeCount} active)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {[
          {
            label: "Total Subscribers",
            value: subscribers.length,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Active",
            value: activeCount,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Inactive",
            value: subscribers.length - activeCount,
            color: "bg-gray-50 text-gray-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div className="font-josefin text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <div className="font-jost text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Email", "Name", "Status", "Subscribed On", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subscribers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 font-jost text-gray-400"
                >
                  No subscribers yet
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-jost text-sm text-gray-900">
                    {s.email}
                  </td>
                  <td className="px-4 py-3 font-jost text-sm text-gray-500">
                    {s.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {s.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-jost text-sm text-gray-500">
                    {formatDate(s.createdAt.toISOString())}
                  </td>
                  <td className="px-4 py-3">
                    <form action={handleDelete.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Users, ShoppingBag } from "lucide-react";

export default async function AdminCustomersPage() {
  const customers = await prisma.user
    .findMany({
      where: { role: "CUSTOMER" },
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">
          Customers
        </h1>
        <p className="font-jost text-sm text-gray-500 mt-1">
          {customers.length} registered customers
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Customer", "Phone", "Orders", "Joined", "Status"].map(
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="font-jost text-gray-400 text-sm">
                      No customers yet
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-josefin font-bold text-primary-500 text-sm">
                            {c.name[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-jost text-sm font-medium text-gray-900">
                            {c.name}
                          </p>
                          <p className="font-jost text-xs text-gray-400">
                            {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-jost text-sm text-gray-500">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-jost text-sm text-gray-700">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                        {c._count.orders}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-jost text-sm text-gray-500">
                      {formatDate(c.createdAt.toISOString())}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MapPin, Plus } from "lucide-react";

export default async function AccountAddressesPage() {
  const session = await auth();
  if (!session) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  }).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-josefin text-2xl font-bold text-gray-900">Saved Addresses</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white font-jost text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-josefin text-xl font-semibold text-gray-900 mb-2">No Addresses Saved</h3>
          <p className="font-jost text-gray-400">Add a delivery address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-jost text-sm font-semibold text-gray-900">{address.name}</p>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-jost rounded-full border border-primary-100">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-jost text-sm text-gray-600">{address.phone}</p>
                  <p className="font-jost text-sm text-gray-500 mt-1">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                  <p className="font-jost text-sm text-gray-500">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="font-jost text-xs text-primary-500 hover:text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button className="font-jost text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

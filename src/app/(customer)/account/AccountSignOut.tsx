"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function AccountSignOut() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost text-red-500 hover:bg-red-50 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}

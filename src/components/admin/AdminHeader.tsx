"use client";

import { useState } from "react";
import { Bell, Search, LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface AdminHeaderProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm font-jost focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="font-josefin font-bold text-white text-sm">
                {user.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <span className="font-jost text-sm text-gray-700 font-medium hidden sm:block">
              {user.name ?? "Admin"}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-jost text-sm font-medium text-gray-900">{user.name}</p>
                <p className="font-jost text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-3 font-jost text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center gap-2 px-4 py-3 font-jost text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

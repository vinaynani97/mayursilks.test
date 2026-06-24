"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingBag, Heart, MapPin, User,
  LogOut, ShoppingCart, Sparkles, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Overview", href: "/account", icon: LayoutDashboard, exact: true },
  { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Profile", href: "/account/profile", icon: User },
];

const quickActions = [
  { label: "Continue Shopping", href: "/products", icon: ShoppingCart },
  { label: "New Arrivals", href: "/products?filter=new", icon: Sparkles },
  { label: "Track My Orders", href: "/account/orders", icon: Package },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AccountSidebar({
  user,
}: {
  user: { name: string; email: string | null };
}) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="w-60 flex-shrink-0 hidden md:flex flex-col gap-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="font-josefin font-bold text-primary-500 text-base">
                {user.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-jost text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="font-jost text-xs text-gray-400 truncate">
                {user.email ?? "Mobile User"}
              </p>
            </div>
          </div>

          <nav className="space-y-0.5">
            {navLinks.map(({ label, href, icon: Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost font-medium transition-all",
                    active
                      ? "bg-primary-50 text-primary-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary-500" : "text-gray-400")} />
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="font-josefin text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Quick Actions
          </p>
          <div className="space-y-0.5">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all group"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Mobile Horizontal Tabs ── */}
      <div className="md:hidden -mx-4 px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {navLinks.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-jost font-medium whitespace-nowrap flex-shrink-0 transition-all border",
                  active
                    ? "bg-primary-500 text-white border-primary-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  Users,
  FileText,
  Ticket,
  Mail,
  Send,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Warehouse,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Emails",        href: "/admin/emails",         icon: Send },
  { label: "Notifications", href: "/admin/notifications",  icon: Bell },
  { label: "Settings",      href: "/admin/settings",       icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col min-h-screen flex-shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-luxury-gradient rounded-lg flex items-center justify-center">
            <span className="font-josefin font-bold text-white text-base">M</span>
          </div>
          <div>
            <div className="font-josefin font-bold text-primary-500 text-sm leading-tight">
              MAYUR SILKS
            </div>
            <div className="font-jost text-[10px] text-gray-400 tracking-widest uppercase">
              Admin Panel
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost font-medium transition-all group",
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              {item.label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jost text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

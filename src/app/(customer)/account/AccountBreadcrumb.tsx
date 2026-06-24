"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

type Crumb = { label: string; href: string };

function getCrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];

  if (pathname === "/account") {
    crumbs.push({ label: "My Account", href: "/account" });
    return crumbs;
  }

  crumbs.push({ label: "My Account", href: "/account" });

  if (pathname === "/account/orders") {
    crumbs.push({ label: "My Orders", href: "/account/orders" });
  } else if (pathname.startsWith("/account/orders/")) {
    crumbs.push({ label: "My Orders", href: "/account/orders" });
    crumbs.push({ label: "Order Details", href: pathname });
  } else if (pathname === "/account/wishlist") {
    crumbs.push({ label: "Wishlist", href: "/account/wishlist" });
  } else if (pathname === "/account/addresses") {
    crumbs.push({ label: "Saved Addresses", href: "/account/addresses" });
  } else if (pathname === "/account/profile") {
    crumbs.push({ label: "My Profile", href: "/account/profile" });
  }

  return crumbs;
}

export default function AccountBreadcrumb() {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 h-10 text-xs font-jost">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                {i === 0 ? (
                  <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-primary-500 transition-colors">
                    <Home className="w-3 h-3" />
                    <span className="hidden sm:inline">Home</span>
                  </Link>
                ) : isLast ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-gray-500 hover:text-primary-500 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

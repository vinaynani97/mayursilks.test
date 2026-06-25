"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Heart, User, Search, Menu, X, ChevronDown, Phone, LogOut,
  LayoutDashboard, Package, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import CustomerNotificationBell from "@/components/notifications/CustomerNotificationBell";

type NavCategory = { id: string; name: string; slug: string };
type NavUser = { id?: string; name?: string | null; email?: string | null; role?: string } | null;

interface NavbarProps {
  categories?: NavCategory[];
  user?: NavUser;
}

export default function Navbar({ categories = [], user = null }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { itemCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  const productChildren = [
    { label: "All Products", href: "/products" },
    ...categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` })),
    { label: "New Arrivals", href: "/products?filter=new" },
    { label: "Best Sellers", href: "/products?filter=bestseller" },
  ];

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products", children: productChildren },
    { label: "About Us", href: "/about" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary-500 text-white text-center py-2 px-4 text-xs font-jost tracking-wide">
        Free Shipping on orders above ₹999 &nbsp;|&nbsp;
        <a href="https://wa.me/919652803383" className="underline hover:text-secondary-300 transition-colors">
          WhatsApp us for quick order
        </a>
      </div>

      {/* Main Navbar */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-white border-b border-gray-100"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-luxury-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-josefin font-bold text-lg">M</span>
                </div>
                <div>
                  <div className="font-josefin font-bold text-primary-500 text-lg leading-tight">MAYUR SILKS</div>
                  <div className="font-jost text-[10px] text-secondary-600 tracking-widest uppercase leading-tight">Pure Handloom</div>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-jost font-medium rounded-md transition-colors duration-200",
                      pathname === link.href ? "text-primary-500" : "text-gray-700 hover:text-primary-500"
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeDropdown === link.label ? "rotate-180" : "")} />
                    )}
                  </Link>

                  {link.children && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-3 text-sm font-jost text-gray-700 hover:bg-primary-50 hover:text-primary-500 transition-colors border-b border-gray-50 last:border-0"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden sm:flex p-2 text-gray-600 hover:text-primary-500 transition-colors rounded-md hover:bg-primary-50"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notification Bell — customers only */}
              {user && user.role !== "ADMIN" && <CustomerNotificationBell />}

              {/* Wishlist */}
              <Link href="/wishlist" className="hidden sm:flex p-2 text-gray-600 hover:text-primary-500 transition-colors rounded-md hover:bg-primary-50 relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="flex p-2 text-gray-600 hover:text-primary-500 transition-colors rounded-md hover:bg-primary-50 relative"
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="count"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* User Menu */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-gray-600 hover:text-primary-500 transition-colors rounded-md hover:bg-primary-50"
                >
                  {user ? (
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="font-josefin font-bold text-primary-500 text-xs">{user.name?.[0]?.toUpperCase() ?? "U"}</span>
                    </div>
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-jost text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="font-jost text-xs text-gray-400 truncate">
                              {user.email ?? "Mobile User"}
                            </p>
                          </div>
                          {user.role === "ADMIN" ? (
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-3 font-jost text-sm text-gray-700 hover:bg-primary-50 transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Admin Panel
                            </Link>
                          ) : (
                            <>
                              <Link href="/account" className="flex items-center gap-2 px-4 py-3 font-jost text-sm text-gray-700 hover:bg-primary-50 transition-colors border-b border-gray-50">
                                <User className="w-4 h-4" /> My Profile
                              </Link>
                              <Link href="/account/orders" className="flex items-center gap-2 px-4 py-3 font-jost text-sm text-gray-700 hover:bg-primary-50 transition-colors border-b border-gray-50">
                                <Package className="w-4 h-4" /> My Orders
                              </Link>
                              <Link href="/wishlist" className="flex items-center gap-2 px-4 py-3 font-jost text-sm text-gray-700 hover:bg-primary-50 transition-colors border-b border-gray-50">
                                <Heart className="w-4 h-4" /> Wishlist
                                {wishlistCount > 0 && <span className="ml-auto text-xs text-gray-400">{wishlistCount}</span>}
                              </Link>
                              <Link href="/account/addresses" className="flex items-center gap-2 px-4 py-3 font-jost text-sm text-gray-700 hover:bg-primary-50 transition-colors border-b border-gray-50">
                                <MapPin className="w-4 h-4" /> Addresses
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-2 px-4 py-3 font-jost text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="block px-4 py-3 font-jost text-sm text-gray-700 hover:bg-primary-50 transition-colors border-b border-gray-50">
                            Login
                          </Link>
                          <Link href="/register" className="block px-4 py-3 font-jost text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Create Account
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href="https://wa.me/919652803383"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-jost font-medium transition-all hover:shadow-lg ml-2"
              >
                <Phone className="w-4 h-4" />
                Contact Us
              </a>

              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary-500 transition-colors"
              >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search for sarees, fabrics, colors..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 font-jost text-sm"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 rounded-lg text-sm font-jost font-medium transition-colors",
                        pathname === link.href ? "bg-primary-50 text-primary-500" : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 mt-1 space-y-1">
                        {link.children.slice(1).map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 rounded-lg text-xs font-jost text-gray-500 hover:bg-gray-50 hover:text-primary-500 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="px-4 py-2">
                        <p className="font-jost text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="font-jost text-xs text-gray-400">{user.email ?? "Mobile User"}</p>
                      </div>
                      {user.role === "ADMIN" ? (
                        <Link href="/admin" className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 text-center flex items-center justify-center gap-2">
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link href="/account" className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link href="/account/orders" className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 flex items-center gap-2">
                            <Package className="w-4 h-4" /> My Orders
                          </Link>
                          <Link href="/wishlist" className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 flex items-center gap-2">
                            <Heart className="w-4 h-4" /> Wishlist
                            {wishlistCount > 0 && <span className="ml-auto text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
                          </Link>
                          <Link href="/account/addresses" className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Addresses
                          </Link>
                        </>
                      )}
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="px-4 py-3 bg-red-50 text-red-600 rounded-lg font-jost text-sm font-medium">Sign Out</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={openCart}
                        className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" /> Cart {itemCount > 0 && `(${itemCount})`}
                      </button>
                      <Link href="/login" className="px-4 py-3 border border-gray-200 rounded-lg font-jost text-sm text-gray-700 text-center">Login</Link>
                      <Link href="/register" className="px-4 py-3 bg-primary-500 text-white rounded-lg font-jost text-sm font-medium text-center">Create Account</Link>
                    </>
                  )}
                  <a
                    href="https://wa.me/919652803383"
                    className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-jost font-medium text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

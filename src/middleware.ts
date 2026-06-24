import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as { role?: string } | undefined)?.role;

  // Admin login page: redirect to admin if already logged in as admin
  if (pathname === "/admin/login") {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  // Admin routes: must be ADMIN
  if (pathname.startsWith("/admin")) {
    if (!session || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Customer login/register: redirect to account if already logged in as customer
  if (pathname === "/login" || pathname === "/register") {
    if (session && role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    if (session && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Customer account routes: must be CUSTOMER
  if (pathname.startsWith("/account")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Checkout: must be logged in (any role that is not admin)
  if (pathname.startsWith("/checkout")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/checkout", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};

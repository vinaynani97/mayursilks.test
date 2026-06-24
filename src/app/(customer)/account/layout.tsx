import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";
import WhatsAppFloat from "@/components/storefront/WhatsAppFloat";
import AccountBreadcrumb from "./AccountBreadcrumb";
import AccountSidebar from "./AccountSidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
  ]);

  if (!session) redirect("/login?callbackUrl=/account");
  if ((session.user as { role?: string }).role === "ADMIN") redirect("/admin");

  const user = session.user as { id: string; name: string; email: string | null };

  return (
    <>
      <Navbar categories={categories} user={session.user ?? null} />
      <CartDrawer />

      <AccountBreadcrumb />

      <div className="bg-[#f8f5f0] min-h-[calc(100vh-64px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex gap-6 lg:gap-8 items-start">
            <AccountSidebar user={{ name: user.name ?? "User", email: user.email }} />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppFloat />
    </>
  );
}

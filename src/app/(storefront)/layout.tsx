import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";
import WhatsAppFloat from "@/components/storefront/WhatsAppFloat";
import CartDrawer from "@/components/storefront/CartDrawer";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [categories, session] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
    auth().catch(() => null),
  ]);

  return (
    <>
      <Navbar categories={categories} user={session?.user ?? null} />
      <CartDrawer />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

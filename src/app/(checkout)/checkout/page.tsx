import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/checkout");

  const userId = session.user.id;

  const [cart, savedAddresses] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                images: true,
                slug: true,
                sku: true,
                stock: true,
                availability: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!cart || cart.items.length === 0) redirect("/cart");

  // Check if any item is out of stock
  const outOfStock = cart.items.filter(
    (i) => i.product.availability === "OUT_OF_STOCK" || i.product.stock < i.quantity
  );
  if (outOfStock.length > 0) redirect("/cart");

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    productId: item.product.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      images: item.product.images,
      slug: item.product.slug,
      sku: item.product.sku,
      category: item.product.category.name,
    },
  }));

  const user = {
    id: userId,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    phone: (session.user as { phone?: string }).phone ?? "",
  };

  return (
    <CheckoutClient
      cartItems={cartItems}
      savedAddresses={savedAddresses}
      user={user}
    />
  );
}

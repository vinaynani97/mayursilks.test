"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  slug: string;
  sku: string;
  category: string;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: CartProduct, quantity?: number) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "mayursilks_cart";

function getLocalCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocalCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function normalizeDbItem(dbItem: {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number | null;
    images: string[];
    slug: string;
    sku: string;
    category: { name: string };
  };
}): CartItem {
  return {
    id: dbItem.id,
    productId: dbItem.productId,
    quantity: dbItem.quantity,
    product: {
      id: dbItem.product.id,
      name: dbItem.product.name,
      price: dbItem.product.price,
      originalPrice: dbItem.product.originalPrice,
      images: dbItem.product.images,
      slug: dbItem.product.slug,
      sku: dbItem.product.sku,
      category: dbItem.product.category?.name ?? "",
    },
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);

  const loadDbCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems((data.items ?? []).map(normalizeDbItem));
    } catch {}
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id ?? null;
    const prevUserId = prevUserIdRef.current;

    if (userId && prevUserId === null) {
      // Just logged in — merge guest cart then load DB cart
      const guestItems = getLocalCart();
      (async () => {
        if (guestItems.length > 0) {
          try {
            await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: guestItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
              }),
            });
            localStorage.removeItem(STORAGE_KEY);
          } catch {}
        }
        await loadDbCart();
      })();
    } else if (!userId) {
      setItems(getLocalCart());
    } else if (userId !== prevUserId) {
      loadDbCart();
    }

    prevUserIdRef.current = userId;
  }, [session?.user?.id, status, loadDbCart]);

  async function addItem(product: CartProduct, quantity = 1) {
    setIsLoading(true);
    try {
      if (session?.user?.id) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity }),
        });
        const data = await res.json();
        if (data.item) {
          setItems((prev) => {
            const exists = prev.find((i) => i.productId === product.id);
            const normalized = normalizeDbItem(data.item);
            if (exists) {
              return prev.map((i) => (i.productId === product.id ? normalized : i));
            }
            return [...prev, normalized];
          });
        }
      } else {
        setItems((prev) => {
          const exists = prev.find((i) => i.productId === product.id);
          const newItems = exists
            ? prev.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [
                ...prev,
                {
                  id: product.id,
                  productId: product.id,
                  quantity,
                  product,
                },
              ];
          saveLocalCart(newItems);
          return newItems;
        });
      }
    } finally {
      setIsLoading(false);
    }
    setIsOpen(true);
  }

  async function updateItem(id: string, quantity: number) {
    // Optimistic update
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );

    if (session?.user?.id) {
      await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
    } else {
      setItems((prev) => {
        saveLocalCart(prev);
        return prev;
      });
    }
  }

  async function removeItem(id: string) {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== id);
      if (!session?.user?.id) saveLocalCart(newItems);
      return newItems;
    });

    if (session?.user?.id) {
      await fetch(`/api/cart/${id}`, { method: "DELETE" });
    }
  }

  async function clearCart() {
    setItems([]);
    if (session?.user?.id) {
      await fetch("/api/cart", { method: "DELETE" });
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isOpen,
        isLoading,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

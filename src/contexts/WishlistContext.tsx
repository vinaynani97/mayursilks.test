"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type WishlistContextType = {
  productIds: Set<string>;
  wishlistCount: number;
  isLoaded: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<"added" | "removed" | null>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((data) => {
          setProductIds(new Set(data.productIds ?? []));
          setIsLoaded(true);
        })
        .catch(() => setIsLoaded(true));
    } else {
      setProductIds(new Set());
      setIsLoaded(true);
    }
  }, [session?.user?.id]);

  async function toggle(productId: string): Promise<"added" | "removed" | null> {
    if (!session?.user?.id) return null;

    const wasWishlisted = productIds.has(productId);

    // Optimistic update
    setProductIds((prev) => {
      const next = new Set(prev);
      if (wasWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      return data.action ?? null;
    } catch {
      // Revert on error
      setProductIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.add(productId);
        else next.delete(productId);
        return next;
      });
      return null;
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        productIds,
        wishlistCount: productIds.size,
        isLoaded,
        isWishlisted: (id) => productIds.has(id),
        toggle,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

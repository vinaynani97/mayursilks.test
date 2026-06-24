import type { Metadata } from "next";
import { Josefin_Sans, Jost } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import "./globals.css";

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mayur Silks — Handwoven Heritage Sarees",
    template: "%s | Mayur Silks",
  },
  description:
    "Premium handloom silk sarees crafted by skilled artisans. Kanchipuram, Pochampally, Dharmavaram and more — delivered directly from weavers to your doorstep.",
  keywords: [
    "handloom sarees",
    "silk sarees",
    "kanchipuram sarees",
    "pochampally sarees",
    "dharmavaram sarees",
    "buy sarees online",
    "pure silk sarees",
    "mayur silks",
  ],
  authors: [{ name: "Mayur Silks" }],
  creator: "Mayur Silks",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mayursilks.com",
    siteName: "Mayur Silks",
    title: "Mayur Silks — Handwoven Heritage Sarees",
    description:
      "Premium handloom silk sarees crafted by skilled artisans and delivered directly from the source.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mayur Silks — Handwoven Heritage Sarees",
    description:
      "Premium handloom silk sarees crafted by skilled artisans and delivered directly from the source.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${josefinSans.variable} ${jost.variable} font-jost antialiased`}>
        <SessionProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

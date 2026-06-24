import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-white font-josefin font-bold text-base">M</span>
            </div>
            <span className="font-josefin font-bold text-primary-500 text-lg">MAYUR SILKS</span>
          </Link>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-jost">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Secure Checkout
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

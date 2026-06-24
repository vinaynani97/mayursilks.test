import Link from "next/link";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Kanchipattu Sarees", href: "/products?category=kanchipattu-sarees" },
    { label: "Pochampally Sarees", href: "/products?category=pochampally-sarees" },
    { label: "Dharmavaram Sarees", href: "/products?category=dharmavaram-sarees" },
    { label: "New Arrivals", href: "/products?filter=new" },
    { label: "Best Sellers", href: "/products?filter=bestseller" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact Us", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Return Policy", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Track Order", href: "/account/orders" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-luxury-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-josefin font-bold text-xl">M</span>
              </div>
              <div>
                <div className="font-josefin font-bold text-white text-xl">MAYUR SILKS</div>
                <div className="font-jost text-xs text-secondary-400 tracking-widest uppercase">
                  Pure Handloom
                </div>
              </div>
            </Link>

            <p className="font-jost text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
              Weaving heritage into every thread. For over 25 years, we&apos;ve
              been crafting pure handloom silk sarees directly from skilled
              artisans to your doorstep — no middlemen, just tradition.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 font-jost">
                  3-87, Bachannapet, Jangaon,<br />
                  Telangana - 500022
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <a
                  href="tel:+919652803383"
                  className="text-sm text-gray-400 hover:text-white font-jost transition-colors"
                >
                  +91 9652 803 383
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <a
                  href="mailto:mayursilks@gmail.com"
                  className="text-sm text-gray-400 hover:text-white font-jost transition-colors"
                >
                  mayursilks@gmail.com
                </a>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary-500 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary-500 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919652803383"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-josefin font-semibold text-white text-sm uppercase tracking-widest mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-jost text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-josefin font-semibold text-white text-sm uppercase tracking-widest mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-jost text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-josefin font-semibold text-white text-sm uppercase tracking-widest mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-jost text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block transition-transform duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-jost text-xs text-gray-500">
              © {new Date().getFullYear()} Mayur Silks. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs font-jost text-gray-500">Secured by</span>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-jost">
                <span className="px-3 py-1 border border-white/10 rounded">Razorpay</span>
                <span className="px-3 py-1 border border-white/10 rounded">SSL Secure</span>
                <span className="px-3 py-1 border border-white/10 rounded">COD Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { motion } from "framer-motion";
import { Shield, Truck, Award, Heart, Gem, Phone } from "lucide-react";

const trustItems = [
  {
    icon: Gem,
    title: "Pure Handloom Silk",
    description: "100% authentic handwoven silk sarees directly from master craftsmen",
  },
  {
    icon: Shield,
    title: "Direct From Weaver",
    description: "No middlemen — sourced directly from artisan families for fair pricing",
  },
  {
    icon: Award,
    title: "Award-Winning Quality",
    description: "Best Weaver Award recipients with 25+ years of weaving excellence",
  },
  {
    icon: Truck,
    title: "Free Pan India Shipping",
    description: "Complimentary shipping on all orders with careful packaging",
  },
  {
    icon: Heart,
    title: "Easy Returns",
    description: "7-day hassle-free return policy on all products",
  },
  {
    icon: Phone,
    title: "WhatsApp Support",
    description: "Instant support via WhatsApp — we're here to help anytime",
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-primary-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="trust-pattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
              <circle cx="12.5" cy="12.5" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#trust-pattern)" />
        </svg>
      </div>

      <div className="container-luxury relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-josefin text-3xl md:text-4xl font-semibold text-white mb-3">
            Why Choose Mayur Silks?
          </h2>
          <p className="font-jost text-white/70 max-w-lg mx-auto">
            Traditional showroom sarees cost ₹40,000+ because of multiple
            intermediaries. We deliver the same premium quality directly from our
            artisans.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trustItems.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 group-hover:bg-secondary-400/20 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <Icon className="w-7 h-7 text-secondary-300 group-hover:text-secondary-200 transition-colors" />
              </div>
              <h3 className="font-josefin text-white font-semibold text-sm mb-2">
                {title}
              </h3>
              <p className="font-jost text-white/60 text-xs leading-relaxed">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Award, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustCards = [
  { icon: Star, label: "25+ Years Experience", sub: "Heritage Craftsmanship" },
  { icon: Award, label: "Best Weaver Award", sub: "Recognised Excellence" },
  { icon: Truck, label: "Free Shipping", sub: "Pan India Delivery" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gray-950">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/95 to-gray-950/60 z-10" />

        {/* Background Image Placeholder */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect fill=%22%23550022%22 width=%22800%22 height=%22600%22/%3E%3Cpattern id=%22p%22 patternUnits=%22userSpaceOnUse%22 width=%2240%22 height=%2240%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%221%22 fill=%22%23fcd146%22 opacity=%220.3%22/%3E%3C/pattern%3E%3Crect fill=%22url(%23p)%22 width=%22800%22 height=%22600%22/%3E%3C/svg%3E')",
          }}
        />

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
          className="absolute top-20 right-20 w-96 h-96 rounded-full border border-secondary-400"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute top-40 right-40 w-64 h-64 rounded-full border border-secondary-400"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute bottom-20 left-1/2 w-80 h-80 rounded-full border border-secondary-400"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          {/* Pre-heading */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[2px] bg-secondary-400" />
            <span className="font-jost text-secondary-400 text-sm tracking-[0.3em] uppercase">
              Premium Handloom Since 2000
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="font-josefin text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight mb-6"
          >
            Handwoven Heritage,
            <br />
            <span className="text-secondary-400 font-semibold">
              Delivered To
            </span>
            <br />
            Your Doorstep
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="font-jost text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
          >
            Authentic handloom silk sarees crafted by skilled artisans — sourced
            directly from the weaver, without middlemen. Premium quality at fair
            prices.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="xl" variant="secondary" className="group">
              <Link href="/products">
                Shop Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/60"
            >
              <Link href="/about">Our Story</Link>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
            className="flex flex-col sm:flex-row gap-4 mt-14"
          >
            {trustCards.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-secondary-400/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-secondary-400" />
                </div>
                <div>
                  <div className="font-jost font-semibold text-white text-sm">{label}</div>
                  <div className="font-jost text-gray-400 text-xs">{sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-jost text-xs text-gray-500 tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-[1px] h-8 bg-gradient-to-b from-gray-500 to-transparent"
        />
      </motion.div>
    </section>
  );
}

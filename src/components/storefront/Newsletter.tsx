"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-20 bg-luxury-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="nl-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 0 15 L 15 0 L 30 15 L 15 30 Z" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nl-pattern)" />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-secondary-400/10" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-secondary-400/10" />

      <div className="container-luxury relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-secondary-300" />
            </div>

            <h2 className="font-josefin text-3xl md:text-4xl font-semibold text-white mb-4">
              Stay Connected with Heritage
            </h2>
            <p className="font-jost text-white/70 text-lg mb-8">
              Subscribe to receive exclusive offers, new collection launches, and
              stories from our artisans.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30 focus-visible:border-white/50"
                />
                <Button type="submit" variant="secondary" className="flex-shrink-0 font-semibold">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 bg-white/10 rounded-xl px-6 py-4 max-w-md mx-auto"
              >
                <CheckCircle className="w-6 h-6 text-secondary-300" />
                <span className="font-jost text-white font-medium">
                  Thank you! You&apos;re on the list.
                </span>
              </motion.div>
            )}

            <p className="font-jost text-white/40 text-xs mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

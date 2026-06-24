"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const visible = [
    testimonials[current % testimonials.length],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  return (
    <section className="luxury-section bg-cream-100 overflow-hidden">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-secondary-500" />
            <span className="font-jost text-secondary-600 text-sm tracking-[0.3em] uppercase">
              Testimonials
            </span>
            <div className="w-8 h-[1px] bg-secondary-500" />
          </div>
          <h2 className="heading-section text-gray-900">
            What Our Customers Say
          </h2>
          <p className="font-jost text-gray-500 mt-3 max-w-md mx-auto">
            Over 1,000 happy customers across India trust Mayur Silks for their most special occasions.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <AnimatePresence mode="wait">
            {visible.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${current}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={cn(
                  "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative",
                  index === 0 && "md:col-span-1 bg-primary-500 text-white border-primary-500"
                )}
              >
                <Quote
                  className={cn(
                    "w-8 h-8 mb-4 opacity-30",
                    index === 0 ? "text-secondary-300" : "text-primary-300"
                  )}
                />

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < testimonial.rating
                          ? index === 0
                            ? "fill-secondary-300 text-secondary-300"
                            : "fill-secondary-400 text-secondary-400"
                          : "text-gray-200"
                      )}
                    />
                  ))}
                </div>

                <p
                  className={cn(
                    "font-jost text-sm leading-relaxed mb-6",
                    index === 0 ? "text-white/90" : "text-gray-600"
                  )}
                >
                  &ldquo;{testimonial.review}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-josefin font-bold text-sm flex-shrink-0",
                      index === 0
                        ? "bg-white/20 text-white"
                        : "bg-primary-100 text-primary-500"
                    )}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      className={cn(
                        "font-jost font-semibold text-sm",
                        index === 0 ? "text-white" : "text-gray-900"
                      )}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      className={cn(
                        "font-jost text-xs",
                        index === 0 ? "text-white/60" : "text-gray-400"
                      )}
                    >
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-4 pt-4 border-t text-xs font-jost",
                    index === 0
                      ? "border-white/20 text-white/50"
                      : "border-gray-100 text-gray-400"
                  )}
                >
                  Purchased: {testimonial.purchasedProduct}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gray-200 hover:border-primary-500 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === current ? "w-6 bg-primary-500" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                )}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gray-200 hover:border-primary-500 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

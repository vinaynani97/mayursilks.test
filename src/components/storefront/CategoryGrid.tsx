"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Category = { id: string; slug: string; name: string; description?: string | null; productCount: number };

const categoryColors = [
  "from-primary-600 to-primary-900",
  "from-primary-500 to-primary-800",
  "from-primary-700 to-primary-900",
  "from-secondary-600 to-secondary-900",
  "from-primary-400 to-primary-700",
  "from-primary-800 to-gray-900",
];

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="luxury-section bg-cream-100">
      <div className="container-luxury">
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-8 h-[1px] bg-secondary-500" />
            <span className="font-jost text-secondary-600 text-sm tracking-[0.3em] uppercase">Explore</span>
            <div className="w-8 h-[1px] bg-secondary-500" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="heading-section text-gray-900"
          >
            Shop by Collection
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-jost text-gray-500 mt-3 max-w-xl mx-auto"
          >
            Each collection is a celebration of a distinct regional weaving tradition, crafted by master artisans.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative block rounded-2xl overflow-hidden h-64 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]}`} />

                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id={`pattern-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <polygon points="10,2 18,8 18,14 10,18 2,14 2,8" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                  </svg>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div>
                    <p className="font-jost text-white/60 text-xs uppercase tracking-widest mb-1">
                      {category.productCount}+ sarees
                    </p>
                    <h3 className="font-josefin text-white text-xl font-semibold mb-2 group-hover:text-secondary-300 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="font-jost text-white/70 text-sm line-clamp-2 mb-4">{category.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-secondary-300 text-sm font-jost font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                      Explore Collection
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 font-jost font-medium text-primary-500 hover:text-primary-700 transition-colors border-b border-primary-500/30 hover:border-primary-500 pb-0.5"
          >
            View All Collections
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

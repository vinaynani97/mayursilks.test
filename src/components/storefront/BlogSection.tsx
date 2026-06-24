"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

type BlogProp = { id: string; slug: string; title: string; excerpt: string; author: string; tags: string[]; readingTime: number; publishedAt: string };

export default function BlogSection({ blogs }: { blogs: BlogProp[] }) {
  return (
    <section className="luxury-section bg-white">
      <div className="container-luxury">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-[1px] bg-secondary-500" />
              <span className="font-jost text-secondary-600 text-xs tracking-[0.3em] uppercase">
                Silk & Heritage
              </span>
            </div>
            <h2 className="heading-section text-gray-900">From Our Blog</h2>
          </div>
          <Link
            href="/blogs"
            className="hidden sm:inline-flex items-center gap-2 font-jost text-sm font-medium text-primary-500 border-b border-primary-500/30 hover:border-primary-500 pb-0.5 transition-all"
          >
            All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <motion.article
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/blogs/${blog.slug}`}>
                {/* Cover Image */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-primary-50 to-primary-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 80 50" className="w-1/2 h-auto text-primary-200" fill="currentColor">
                      <rect x="0" y="0" width="80" height="50" rx="4" fill="currentColor" opacity="0.3" />
                      <path d="M10 35 Q40 5 70 35" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                    </svg>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="font-jost text-xs text-gray-600">{blog.readingTime} min</span>
                  </div>
                  <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/20 transition-colors duration-300" />
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="font-jost text-[11px] text-primary-500 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="font-josefin font-semibold text-gray-900 text-lg leading-snug mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="font-jost text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                  {blog.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <div className="font-jost text-sm font-medium text-gray-700">{blog.author}</div>
                    <div className="font-jost text-xs text-gray-400">{formatDate(blog.publishedAt)}</div>
                  </div>
                  <div className="text-primary-500 text-sm font-jost font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Mobile view all */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 font-jost text-sm font-medium text-primary-500 border-b border-primary-500/30 pb-0.5"
          >
            All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

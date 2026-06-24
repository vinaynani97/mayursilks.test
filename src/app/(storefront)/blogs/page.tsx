import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — Silk & Heritage",
  description: "Stories, guides, and heritage — explore articles about handloom silk sarees, weaving traditions, and styling tips from Mayur Silks.",
};

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const [featured, ...rest] = blogs;

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-luxury-gradient py-16 px-4 text-center">
        <h1 className="font-josefin text-4xl md:text-5xl font-light text-white mb-3">Silk &amp; Heritage</h1>
        <p className="font-jost text-white/70 max-w-xl mx-auto">Stories, guides, and heritage from the world of handloom silk sarees</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-jost text-gray-400 text-lg">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/blogs/${featured.slug}`} className="group block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="h-64 lg:h-auto bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <span className="font-josefin text-primary-300 text-8xl">✦</span>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featured.tags.slice(0, 3).map((t) => (
                        <span key={t} className="font-jost text-xs text-primary-500 bg-primary-50 px-3 py-1 rounded-full">{t}</span>
                      ))}
                      <span className="font-jost text-xs text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full font-medium">Featured</span>
                    </div>
                    <h2 className="font-josefin text-2xl md:text-3xl font-semibold text-gray-900 mb-4 group-hover:text-primary-500 transition-colors leading-snug">{featured.title}</h2>
                    <p className="font-jost text-gray-500 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-jost text-sm font-medium text-gray-700">{featured.author}</p>
                        <p className="font-jost text-xs text-gray-400">{formatDate((featured.createdAt).toISOString())}</p>
                      </div>
                      <div className="flex items-center gap-1.5 font-jost text-sm font-medium text-primary-500">
                        <Clock className="w-4 h-4" /> {featured.readingTime} min read
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((blog) => (
                  <Link key={blog.id} href={`/blogs/${blog.slug}`} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-44 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                      <span className="font-josefin text-primary-200 text-5xl">✦</span>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {blog.tags.slice(0, 2).map((t) => (
                          <span key={t} className="font-jost text-[11px] text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                      <h3 className="font-josefin font-semibold text-gray-900 leading-snug mb-3 group-hover:text-primary-500 transition-colors line-clamp-2">{blog.title}</h3>
                      <p className="font-jost text-sm text-gray-500 line-clamp-2 mb-4">{blog.excerpt}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="font-jost text-xs text-gray-400">{formatDate((blog.createdAt).toISOString())}</p>
                        <div className="flex items-center gap-1 font-jost text-xs text-primary-500">
                          <Clock className="w-3 h-3" /> {blog.readingTime} min
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock, Calendar, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({ where: { slug, isPublished: true } }).catch(() => null);
  if (!blog) return { title: "Blog Not Found" };
  return { title: blog.title, description: blog.excerpt };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({ where: { slug, isPublished: true } }).catch(() => null);
  if (!blog) return notFound();

  const related = await prisma.blog.findMany({
    where: { isPublished: true, NOT: { slug } },
    take: 2,
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 h-80 flex items-center justify-center">
        {blog.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <span className="font-josefin text-primary-200 text-9xl">✦</span>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/blogs" className="inline-flex items-center gap-2 font-jost text-sm text-gray-500 hover:text-primary-500 mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4" /> All Articles
        </Link>

        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag) => (
                <span key={tag} className="font-jost text-xs text-primary-500 bg-primary-50 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>

            <h1 className="font-josefin text-3xl md:text-4xl font-semibold text-gray-900 mb-6 leading-tight">{blog.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-jost text-gray-500 pb-8 border-b border-gray-100 mb-8">
              <div className="flex items-center gap-2"><User className="w-4 h-4" />{blog.author}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{formatDate(blog.createdAt.toISOString())}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{blog.readingTime} min read</div>
            </div>

            <div className="prose prose-sm md:prose max-w-none font-jost text-gray-600 leading-relaxed">
              {blog.content.split("\n\n").map((para, idx) => {
                if (para.startsWith("# ")) return <h1 key={idx} className="font-josefin text-2xl font-bold text-gray-900 mt-8 mb-4">{para.replace("# ", "")}</h1>;
                if (para.startsWith("## ")) return <h2 key={idx} className="font-josefin text-xl font-semibold text-gray-900 mt-6 mb-3">{para.replace("## ", "")}</h2>;
                if (para.match(/^\d+\./)) return (
                  <ol key={idx} className="list-decimal pl-6 mb-4 space-y-2">
                    {para.split("\n").map((line, j) => <li key={j} className="text-gray-600">{line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "")}</li>)}
                  </ol>
                );
                return <p key={idx} className="mb-4">{para}</p>;
              })}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-josefin text-2xl font-semibold text-gray-900 mb-6">More Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {related.map((b) => (
                <Link key={b.id} href={`/blogs/${b.slug}`} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {b.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="font-jost text-[11px] text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-josefin font-semibold text-gray-900 text-base leading-snug group-hover:text-primary-500 transition-colors mb-2">{b.title}</h3>
                  <p className="font-jost text-gray-500 text-sm line-clamp-2">{b.excerpt}</p>
                  <div className="flex items-center gap-2 mt-3 font-jost text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {b.readingTime} min read · {formatDate(b.createdAt.toISOString())}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

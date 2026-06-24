"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, X, Loader2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createBlog, updateBlog, deleteBlog } from "@/actions/blogs";

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  author: string;
  isPublished: boolean;
  tags: string[];
  readingTime: number;
  createdAt: Date;
};

export default function AdminBlogsClient({ blogs }: { blogs: Blog[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [formError, setFormError] = useState("");

  function openAdd() {
    setEditing(null);
    setFormError("");
    setShowModal(true);
  }
  function openEdit(blog: Blog) {
    setEditing(blog);
    setFormError("");
    setShowModal(true);
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    startTransition(async () => {
      await deleteBlog(id);
      router.refresh();
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (editing) {
          await updateBlog(editing.id, fd);
        } else {
          await createBlog(fd);
        }
        setShowModal(false);
        router.refresh();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-josefin text-2xl font-bold text-gray-900">
            Blogs
          </h1>
          <p className="font-jost text-sm text-gray-500 mt-1">
            {blogs.length} articles
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-jost font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
              <span className="font-josefin text-primary-200 text-4xl">✦</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                {blog.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="font-jost text-[11px] text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </span>
                ))}
                <span
                  className={`ml-auto text-[11px] font-jost px-2 py-0.5 rounded-full font-medium ${blog.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
              </div>
              <h3 className="font-josefin font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">
                {blog.title}
              </h3>
              <p className="font-jost text-xs text-gray-400 mb-4">
                {blog.author} · {blog.readingTime} min ·{" "}
                {formatDate(blog.createdAt.toISOString())}
              </p>
              <div className="flex items-center gap-2">
                {blog.isPublished && (
                  <a
                    href={`/blogs/${blog.slug}`}
                    target="_blank"
                    className="p-1.5 text-gray-400 hover:text-blue-500"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => openEdit(blog)}
                  className="p-1.5 text-gray-400 hover:text-primary-500"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(blog.id, blog.title)}
                  className="p-1.5 text-gray-400 hover:text-red-500 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <p className="font-jost text-gray-400 mb-4">
              No blogs yet. Write your first article!
            </p>
            <button
              onClick={openAdd}
              className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-jost font-medium text-sm"
            >
              New Article
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-josefin text-xl font-semibold text-gray-900">
                {editing ? "Edit Article" : "New Article"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-jost text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Title *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editing?.title}
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  required
                  rows={2}
                  defaultValue={editing?.excerpt}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                />
              </div>
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Content *
                </label>
                <textarea
                  name="content"
                  required
                  rows={8}
                  defaultValue={editing?.content}
                  placeholder="Supports Markdown: # Heading, ## Subheading, **bold**, etc."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Author *
                  </label>
                  <input
                    name="author"
                    required
                    defaultValue={editing?.author ?? "Mayur Silks Team"}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Reading Time (min)
                  </label>
                  <input
                    name="readingTime"
                    type="number"
                    min="1"
                    defaultValue={editing?.readingTime ?? 5}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  name="tags"
                  defaultValue={editing?.tags?.join(", ")}
                  placeholder="silk, care, tips"
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  name="coverImage"
                  defaultValue={editing?.coverImage ?? ""}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isPublished"
                  value="true"
                  id="isPublished"
                  defaultChecked={editing?.isPublished}
                  className="w-4 h-4 accent-primary-500"
                />
                <label
                  htmlFor="isPublished"
                  className="font-jost text-sm text-gray-700 cursor-pointer"
                >
                  Publish immediately
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-gray-200 text-gray-700 font-jost font-medium rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editing ? (
                    "Update"
                  ) : (
                    "Publish"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "@/actions/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
};

export default function AdminCategoriesClient({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formError, setFormError] = useState("");

  function openAdd() {
    setEditing(null);
    setFormError("");
    setShowModal(true);
  }
  function openEdit(cat: Category) {
    setEditing(cat);
    setFormError("");
    setShowModal(true);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Products in it will be unlinked.`))
      return;
    startTransition(async () => {
      await deleteCategory(id);
      router.refresh();
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleCategoryStatus(id, !isActive);
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
          await updateCategory(editing.id, fd);
        } else {
          await createCategory(fd);
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
            Categories
          </h1>
          <p className="font-jost text-sm text-gray-500 mt-1">
            {categories.length} categories
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-jost font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="font-josefin font-semibold text-gray-900 text-base truncate">
                  {cat.name}
                </h3>
                <p className="font-mono text-xs text-gray-400 mt-0.5">
                  {cat.slug}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium flex-shrink-0 ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {cat.isActive ? "Active" : "Disabled"}
              </span>
            </div>

            {cat.description && (
              <p className="font-jost text-sm text-gray-500 line-clamp-2 mb-3">
                {cat.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="font-jost text-sm text-gray-500">
                {cat._count.products} products
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(cat.id, cat.isActive)}
                  disabled={isPending}
                  className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                  title={cat.isActive ? "Disable" : "Enable"}
                >
                  {cat.isActive ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  disabled={isPending}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <p className="font-jost text-gray-400 mb-4">
            No categories yet. Add your first one!
          </p>
          <button
            onClick={openAdd}
            className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-jost font-medium text-sm"
          >
            Add Category
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-josefin text-xl font-semibold text-gray-900">
                {editing ? "Edit Category" : "Add Category"}
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
                  Category Name *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editing?.name}
                  placeholder="e.g. Kanchipuram Sarees"
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ""}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                />
              </div>

              <div>
                <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                  Image URL
                </label>
                <input
                  name="image"
                  defaultValue={editing?.image ?? ""}
                  placeholder="https://..."
                  className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    name="sortOrder"
                    type="number"
                    min="0"
                    defaultValue={editing?.sortOrder ?? 0}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      value="true"
                      defaultChecked={editing?.isActive ?? true}
                      className="w-4 h-4 accent-primary-500"
                    />
                    <span className="font-jost text-sm text-gray-700">
                      Active
                    </span>
                  </label>
                </div>
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
                    "Create"
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

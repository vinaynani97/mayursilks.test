"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/products";
import Image from "next/image";

type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  images: string[];
  fabric: string;
  weavingTechnique: string;
  designDetails: string;
  length: string;
  color: string;
  availability: string;
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  tags: string[];
  categoryId: string;
  category: Category;
};

const AVAILABILITY_OPTIONS = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "MADE_TO_ORDER", label: "Made to Order" },
];

const availabilityStyle: Record<string, string> = {
  IN_STOCK: "bg-green-100 text-green-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
  MADE_TO_ORDER: "bg-yellow-100 text-yellow-700",
};

export default function AdminProductsClient({
  products: initialProducts,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formError, setFormError] = useState("");

  const filtered = initialProducts.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterStatus === "all" ||
      (filterStatus === "new" && p.isNew) ||
      (filterStatus === "bestseller" && p.isBestSeller) ||
      (filterStatus === "featured" && p.isFeatured) ||
      (filterStatus === "outofstock" && p.availability === "OUT_OF_STOCK");
    return matchSearch && matchFilter;
  });

  function openAdd() {
    setEditingProduct(null);
    setUploadedImages([]);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setUploadedImages(product.images);
    setFormError("");
    setShowModal(true);
  }

  async function handleImageUpload(files: FileList) {
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    fd.append("folder", "mayursilks/products");

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.urls) {
      setUploadedImages((prev) => [...prev, ...data.urls]);
    } else {
      setFormError("Image upload failed. Check Cloudinary credentials.");
    }
    setUploading(false);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProduct(id);
      router.refresh();
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Replace images with uploaded ones
    fd.delete("images");
    uploadedImages.forEach((url) => fd.append("images", url));

    startTransition(async () => {
      try {
        if (editingProduct) {
          await updateProduct(editingProduct.id, fd);
        } else {
          await createProduct(fd);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-josefin text-2xl font-bold text-gray-900">
            Products
          </h1>
          <p className="font-jost text-sm text-gray-500 mt-1">
            {initialProducts.length} total products
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-jost font-medium text-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 border border-gray-200 rounded-lg text-sm font-jost focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "new", "bestseller", "featured", "outofstock"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-jost font-medium transition-all ${filterStatus === f ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {f === "all"
                ? "All"
                : f === "outofstock"
                  ? "Out of Stock"
                  : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3.5 text-left font-jost text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 font-jost text-gray-400"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 flex-shrink-0 overflow-hidden">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-jost text-sm font-medium text-gray-900 line-clamp-1 max-w-48">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {product.isNew && (
                              <Badge
                                variant="new"
                                className="text-[10px] px-1.5 py-0"
                              >
                                NEW
                              </Badge>
                            )}
                            {product.isBestSeller && (
                              <Badge
                                variant="bestseller"
                                className="text-[10px] px-1.5 py-0"
                              >
                                BESTSELLER
                              </Badge>
                            )}
                            {product.isFeatured && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0 rounded-full font-medium">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4 font-jost text-sm text-gray-500">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-jost font-semibold text-sm text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                      {product.originalPrice && (
                        <div className="font-jost text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-jost text-sm text-gray-700">
                      {product.stock}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-jost font-medium ${availabilityStyle[product.availability] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {AVAILABILITY_OPTIONS.find(
                          (o) => o.value === product.availability,
                        )?.label ?? product.availability}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={isPending}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-josefin text-xl font-semibold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-jost text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={editingProduct?.name}
                    placeholder="e.g. Kanchipuram Royal Silk Saree"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    required
                    defaultValue={editingProduct?.categoryId}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Availability *
                  </label>
                  <select
                    name="availability"
                    defaultValue={editingProduct?.availability ?? "IN_STOCK"}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 bg-white"
                  >
                    {AVAILABILITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    min="0"
                    defaultValue={editingProduct?.price}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Original Price (₹)
                  </label>
                  <input
                    name="originalPrice"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.originalPrice ?? ""}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Stock Quantity *
                  </label>
                  <input
                    name="stock"
                    type="number"
                    required
                    min="0"
                    defaultValue={editingProduct?.stock ?? 0}
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Color *
                  </label>
                  <input
                    name="color"
                    required
                    defaultValue={editingProduct?.color}
                    placeholder="e.g. Royal Maroon with Gold"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Fabric *
                  </label>
                  <input
                    name="fabric"
                    required
                    defaultValue={editingProduct?.fabric}
                    placeholder="e.g. Pure Mulberry Silk"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Weaving Technique *
                  </label>
                  <input
                    name="weavingTechnique"
                    required
                    defaultValue={editingProduct?.weavingTechnique}
                    placeholder="e.g. Traditional Kanchipuram Weave"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Length *
                  </label>
                  <input
                    name="length"
                    required
                    defaultValue={editingProduct?.length}
                    placeholder="e.g. 6.3 meters with blouse piece"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    defaultValue={editingProduct?.description}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Design Details
                  </label>
                  <textarea
                    name="designDetails"
                    rows={2}
                    defaultValue={editingProduct?.designDetails}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Tags (comma separated)
                  </label>
                  <input
                    name="tags"
                    defaultValue={editingProduct?.tags?.join(", ")}
                    placeholder="silk, wedding, kanchipuram"
                    className="w-full h-10 px-4 border border-gray-200 rounded-xl font-jost text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                {/* Flags */}
                <div className="sm:col-span-2">
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-3">
                    Product Flags
                  </label>
                  <div className="flex flex-wrap gap-6">
                    {[
                      {
                        name: "isNew",
                        label: "New Arrival",
                        defaultChecked: editingProduct?.isNew,
                      },
                      {
                        name: "isBestSeller",
                        label: "Best Seller",
                        defaultChecked: editingProduct?.isBestSeller,
                      },
                      {
                        name: "isFeatured",
                        label: "Featured",
                        defaultChecked: editingProduct?.isFeatured,
                      },
                    ].map((flag) => (
                      <label
                        key={flag.name}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name={flag.name}
                          value="true"
                          defaultChecked={flag.defaultChecked}
                          className="w-4 h-4 accent-primary-500"
                        />
                        <span className="font-jost text-sm text-gray-700">
                          {flag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="sm:col-span-2">
                  <label className="block font-jost text-sm font-medium text-gray-700 mb-1.5">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-300" />
                      )}
                      <span className="font-jost text-sm text-gray-500">
                        {uploading
                          ? "Uploading..."
                          : "Click to upload images (multiple allowed)"}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files && handleImageUpload(e.target.files)
                        }
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {uploadedImages.map((url, i) => (
                        <div
                          key={i}
                          className="relative w-20 h-24 rounded-lg overflow-hidden border border-gray-200"
                        >
                          <Image
                            src={url}
                            alt={`Product ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setUploadedImages((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 border border-gray-200 text-gray-700 font-jost font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || uploading}
                  className="flex-1 h-11 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-jost font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Create Product"
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

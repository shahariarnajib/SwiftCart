"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { slugify } from "@/lib/format";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  regularPrice: string | number;
  salePrice: string | number;
  stock: string | number;
  description: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  status: string;
  specifications: Array<{ key: string; value: string }> | string | null;
  images: string[];
}

interface InternalFormState {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  regularPrice: string | number;
  salePrice: string | number;
  stock: string | number;
  description: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  status: string;
  specifications: Array<{ key: string; value: string }>;
  images: string[];
}

export function ProductForm({
  categories,
  initialData,
  isEdit = false,
}: {
  categories: CategoryOption[];
  initialData?: Partial<ProductFormData>;
  isEdit?: boolean;
}) {
  const router = useRouter();

  // Parse initial specs if JSON string
  let initialSpecs: Array<{ key: string; value: string }> = [
    { key: "Warranty", value: "1 Year Replacement Warranty" },
    { key: "Origin", value: "Original Authentic" },
  ];

  if (initialData?.specifications) {
    if (Array.isArray(initialData.specifications)) {
      initialSpecs = initialData.specifications;
    } else if (typeof initialData.specifications === "string") {
      try {
        const obj = JSON.parse(initialData.specifications);
        initialSpecs = Object.entries(obj).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      } catch {}
    }
  }

  const [form, setForm] = useState<InternalFormState>({
    id: initialData?.id,
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || (categories[0]?.id ?? ""),
    regularPrice: initialData?.regularPrice !== undefined ? initialData.regularPrice : "",
    salePrice: initialData?.salePrice !== undefined && initialData?.salePrice !== null ? initialData.salePrice : "",
    stock: initialData?.stock !== undefined ? initialData.stock : 10,
    description: initialData?.description || "",
    isFeatured: Boolean(initialData?.isFeatured),
    isNewArrival: Boolean(initialData?.isNewArrival),
    status: initialData?.status || "ACTIVE",
    specifications: initialSpecs,
    images: initialData?.images && initialData.images.length > 0 ? initialData.images : [""],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isEdit && (!form.slug || form.slug === slugify(form.name))) {
      setForm((prev) => ({ ...prev, name: val, slug: slugify(val) }));
    } else {
      setForm((prev) => ({ ...prev, name: val }));
    }
  };

  const addSpecRow = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const removeSpecRow = (index: number) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpecRow = (index: number, field: "key" | "value", val: string) => {
    setForm((prev) => {
      const updated = [...prev.specifications];
      updated[index][field] = val;
      return { ...prev, specifications: updated };
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images.filter(Boolean), newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.sku.trim() || !form.categoryId || form.regularPrice === "") {
      setError("Please fill in the required fields (Name, SKU, Category, Regular Price).");
      return;
    }

    // Convert specs array to object
    const specMap: Record<string, string> = {};
    form.specifications.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specMap[s.key.trim()] = s.value.trim();
      }
    });

    const cleanImages = form.images.filter((img) => typeof img === "string" && img.trim().length > 0);
    if (cleanImages.length === 0) {
      setError("Please specify at least one product image URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        regularPrice: parseFloat(String(form.regularPrice)),
        salePrice: form.salePrice !== "" ? parseFloat(String(form.salePrice)) : null,
        stock: parseInt(String(form.stock), 10) || 0,
        description: form.description.trim(),
        specifications: specMap,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        status: form.status,
        images: cleanImages,
      };

      const url = isEdit ? `/api/products/${form.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product.");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-slate-400">
              {isEdit ? `Updating: ${form.name}` : "Create a new catalog item for Swift Cart"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? "Update Product" : "Publish Product"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Main Form Cards */}
      <div className="space-y-6">
        {/* Card 1: Core Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Swift Wireless ANC Headphones"
                value={form.name}
                onChange={handleNameChange}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SKU (Unique Code) *</label>
              <input
                type="text"
                required
                placeholder="e.g. ELEC-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Publication Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium"
              >
                <option value="ACTIVE">ACTIVE (Visible in Store)</option>
                <option value="DRAFT">DRAFT (Hidden)</option>
                <option value="ARCHIVED">ARCHIVED (Discontinued)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Full description of features, materials, and benefits..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Card 2: Pricing and Inventory */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Regular Price (৳ BDT) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                placeholder="3500"
                value={form.regularPrice}
                onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Sale / Discount Price (৳ BDT)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Leave blank if no discount"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="50"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">
                Feature on Homepage &ldquo;Featured Products&rdquo;
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-800">
                Mark as &ldquo;New Arrival&rdquo;
              </span>
            </label>
          </div>
        </div>

        {/* Card 3: Images */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Product Images
            </h3>
            <span className="text-xs text-slate-400">First image will be the primary thumbnail</span>
          </div>

          {/* Add Image input */}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste public image URL (e.g. Unsplash or CDN URL)..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={addImage}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Add URL
            </button>
          </div>

          {/* Thumbnails preview grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {form.images.map((img, idx) => {
              if (!img) return null;
              return (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square"
                >
                  <Image src={img} alt="Product image" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                      Primary
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Technical Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Technical Specifications
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Key-value attributes shown in the product details table
              </p>
            </div>
            <button
              type="button"
              onClick={addSpecRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {form.specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Battery Life)"
                  value={spec.key}
                  onChange={(e) => updateSpecRow(index, "key", e.target.value)}
                  className="w-1/3 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 40 Hours continuous)"
                  value={spec.value}
                  onChange={(e) => updateSpecRow(index, "value", e.target.value)}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Remove spec"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

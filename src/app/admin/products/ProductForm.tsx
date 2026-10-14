"use client";

import React, { useState, useRef } from "react";
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
  UploadCloud,
  Loader2,
  Star,
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image(s).");
      }

      const newUrls: string[] = data.urls || (data.url ? [data.url] : []);
      if (newUrls.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images.filter(Boolean), ...newUrls],
        }));
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const setPrimaryImage = (index: number) => {
    setForm((prev) => {
      const images = [...prev.images.filter(Boolean)];
      if (index >= 0 && index < images.length) {
        const [selected] = images.splice(index, 1);
        images.unshift(selected);
      }
      return { ...prev, images };
    });
  };

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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span>Product Images</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload image files directly from your computer or provide image URLs
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
              {form.images.filter(Boolean).length} {form.images.filter(Boolean).length === 1 ? "Image" : "Images"}
            </span>
          </div>

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Hidden direct file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            className="hidden"
          />

          {/* Direct File Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
              isUploading
                ? "border-brand-400 bg-brand-50/50 cursor-wait"
                : "border-slate-300 hover:border-brand-500 hover:bg-slate-50/80 active:scale-[0.99]"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                <span className="text-xs font-bold text-slate-800">Uploading your image(s)...</span>
                <span className="text-[11px] text-slate-400">Processing and saving directly to storage</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-800 block">
                    Click to browse and upload product images directly
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Supports JPG, PNG, WEBP, GIF, SVG (up to 10MB each). Multiple images supported.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-colors"
                >
                  Choose Image Files
                </button>
              </>
            )}
          </div>

          {/* Alternative: Add Image by URL */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Or paste image URL
            </span>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/product-image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Thumbnails preview grid */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 block mb-2.5">
              Current Images ({form.images.filter(Boolean).length})
            </span>

            {form.images.filter(Boolean).length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/60 text-center text-slate-400 text-xs">
                No images added yet. Click &ldquo;Choose Image Files&rdquo; above to upload directly!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {form.images.map((img, idx) => {
                  if (!img) return null;
                  return (
                    <div
                      key={idx}
                      className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-square shadow-xs"
                    >
                      <Image
                        src={img}
                        alt={`Product image ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized={img.startsWith("/uploads/")}
                      />

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(idx)}
                            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 transition-colors"
                            title="Make Primary Thumbnail"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {idx === 0 && (
                        <span className="absolute bottom-2 left-2 bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                          Primary
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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

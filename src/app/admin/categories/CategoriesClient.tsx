"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Plus, Edit, Trash2, Layers, AlertCircle, X, Check, UploadCloud, Loader2 } from "lucide-react";
import { slugify, getSafeImageUrl } from "@/lib/format";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  orderIndex: number;
  isVisible: boolean;
  _count: { products: number };
}

export function CategoriesClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormImage("");
    setError(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description || "");
    setFormImage(cat.image || "");
    setError(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("bucket", "category-images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload category image");
      }

      const uploadedUrl = data.url || data.urls?.[0];
      if (uploadedUrl) {
        setFormImage(uploadedUrl);
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName.trim()),
        description: formDesc.trim(),
        image: formImage.trim(),
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...data, _count: data._count || c._count } : c
          )
        );
        setToastMsg(`Category "${data.name}" updated successfully!`);
      } else {
        setCategories((prev) => [...prev, { ...data, _count: data._count || { products: 0 } }]);
        setToastMsg(`Category "${data.name}" created successfully!`);
      }

      setModalOpen(false);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete "${name}" because it contains ${count} assigned products. Reassign or delete those products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete category");
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setToastMsg(`Category "${name}" deleted.`);
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch {
      alert("Error deleting category");
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize products into intuitive collections for shoppers
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-4">
                <Image
                  src={getSafeImageUrl(cat.image)}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-base font-black text-slate-900">{cat.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
                  {cat._count.products} Products
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mb-2">/{cat.slug}</p>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {cat.description || "No description provided for this collection."}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => openEditModal(cat)}
                className="p-2 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-colors"
                title="Edit Category"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full z-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-black text-slate-900">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Watches"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) setFormSlug(slugify(e.target.value));
                  }}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="smart-watches"
                  value={formSlug}
                  onChange={(e) => setFormSlug(slugify(e.target.value))}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadError && (
                  <p className="text-xs text-rose-600 mb-2">{uploadError}</p>
                )}

                {formImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 mb-2 bg-slate-100 group">
                    <img src={getSafeImageUrl(formImage)} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-2.5 py-1 rounded-lg bg-white text-slate-900 text-xs font-bold shadow-xs hover:bg-slate-100"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImage("")}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-xs hover:bg-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 mb-2 hover:bg-slate-50"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5 text-brand-600" />
                        <span className="text-xs font-bold text-slate-700">Click to upload category image</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG, WEBP, SVG (Max 5MB)</span>
                      </>
                    )}
                  </button>
                )}

                <input
                  type="text"
                  placeholder="Or paste image URL (https://... or /uploads/...)"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of products in this category..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

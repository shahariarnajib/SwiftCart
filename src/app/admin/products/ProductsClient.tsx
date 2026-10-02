"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Star,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  regularPrice: number;
  salePrice: number | null;
  stock: number;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  category: { id: string; name: string };
  images: Array<{ url: string }>;
}

interface CategoryOption {
  id: string;
  name: string;
}

export function ProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: ProductRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStock, setSelectedStock] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter products locally for instantaneous response
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category.id !== selectedCategory) {
      return false;
    }
    if (selectedStock === "IN_STOCK" && p.stock <= 0) return false;
    if (selectedStock === "LOW_STOCK" && (p.stock <= 0 || p.stock > 5)) return false;
    if (selectedStock === "OUT_OF_STOCK" && p.stock > 0) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete product");
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      }
    } catch {
      alert("Error deleting product");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store&apos;s product listings, pricing, and active status
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700 font-medium"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700 font-medium"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock (≤ 5)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Flags</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const primaryImg =
                    p.images.length > 0
                      ? p.images[0].url
                      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80";

                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Image */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                            <Image src={primaryImg} alt={p.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="font-bold text-slate-900 hover:text-brand-600 transition-colors truncate block"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[11px] text-slate-400 truncate block">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-3.5 font-mono text-slate-500 font-semibold">{p.sku}</td>

                      {/* Category */}
                      <td className="px-6 py-3.5 text-slate-700 font-semibold">{p.category.name}</td>

                      {/* Price */}
                      <td className="px-6 py-3.5">
                        <div className="font-extrabold text-slate-900">
                          {p.salePrice ? formatCurrency(p.salePrice) : formatCurrency(p.regularPrice)}
                        </div>
                        {p.salePrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            {formatCurrency(p.regularPrice)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-3.5">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Out of stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Low ({p.stock})
                          </span>
                        ) : (
                          <span className="text-slate-800 font-bold">{p.stock} units</span>
                        )}
                      </td>

                      {/* Badges / Flags */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {p.isFeatured && (
                            <span
                              className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center"
                              title="Featured Product"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                            </span>
                          )}
                          {p.isNewArrival && (
                            <span
                              className="w-5 h-5 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center"
                              title="New Arrival"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="View on site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full z-10 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Delete this product?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              If this product has historical orders, it will be safely archived instead of corrupting
              past receipts.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { Search, Warehouse, AlertTriangle, CheckCircle2, Save, RefreshCw } from "lucide-react";

interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stock: number;
  regularPrice: number;
  salePrice: number | null;
  category: { name: string };
  images: Array<{ url: string }>;
}

export function InventoryClient({ initialProducts }: { initialProducts: InventoryProduct[] }) {
  const [products, setProducts] = useState<InventoryProduct[]>(initialProducts);
  const [filter, setFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [search, setSearch] = useState("");
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    if (filter === "IN_STOCK" && p.stock <= 5) return false;
    if (filter === "LOW_STOCK" && (p.stock <= 0 || p.stock > 5)) return false;
    if (filter === "OUT_OF_STOCK" && p.stock > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleStockInputChange = (id: string, val: number) => {
    setStockInputs((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const handleSaveStock = async (p: InventoryProduct) => {
    const newStock = stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;
    setUpdatingId(p.id);

    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) throw new Error("Failed to update stock");

      setProducts((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, stock: newStock } : item))
      );
      setSuccessId(p.id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch {
      alert("Error saving stock");
    } finally {
      setUpdatingId(null);
    }
  };

  const inStockCount = products.filter((p) => p.stock > 5).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track stock levels across the warehouse and quickly restock fast-selling items
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setFilter("IN_STOCK")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "IN_STOCK"
              ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase">
            <span>Healthy Stock</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{inStockCount} SKUs</div>
          <span className="text-[11px] text-slate-500 mt-1 block">&gt; 5 units available</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("LOW_STOCK")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "LOW_STOCK"
              ? "border-amber-500 bg-amber-50/60 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase">
            <span>Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{lowStockCount} SKUs</div>
          <span className="text-[11px] text-slate-500 mt-1 block">1 to 5 units remaining</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("OUT_OF_STOCK")}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filter === "OUT_OF_STOCK"
              ? "border-rose-500 bg-rose-50/60 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 uppercase">
            <span>Out of Stock</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1">{outOfStockCount} SKUs</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Purchases disabled</span>
        </button>
      </div>

      {/* Search & Reset */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name or SKU to update stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {filter !== "ALL" && (
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Show All
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5">SKU</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Quick Adjust</th>
                <th className="px-6 py-3.5 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map((p) => {
                const img =
                  p.images.length > 0
                    ? p.images[0].url
                    : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80";

                const isOut = p.stock === 0;
                const isLow = p.stock > 0 && p.stock <= 5;
                const currentVal =
                  stockInputs[p.id] !== undefined ? stockInputs[p.id] : p.stock;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                          <Image src={img} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-brand-600 truncate block max-w-xs"
                          >
                            {p.name}
                          </Link>
                          <span className="text-[11px] text-slate-400">
                            Price: {formatCurrency(p.salePrice ?? p.regularPrice)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-500 font-bold">{p.sku}</td>

                    <td className="px-6 py-3.5 text-slate-600 font-semibold">{p.category.name}</td>

                    <td className="px-6 py-3.5">
                      {isOut ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          0 (Out of Stock)
                        </span>
                      ) : isLow ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {p.stock} units (Low)
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.stock} units
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={currentVal}
                          onChange={(e) =>
                            handleStockInputChange(p.id, parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 px-2.5 py-1 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleStockInputChange(p.id, currentVal + 10)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStockInputChange(p.id, currentVal + 25)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                          title="Add 25 units"
                        >
                          +25
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {successId === p.id ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSaveStock(p)}
                          disabled={updatingId === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{updatingId === p.id ? "Saving..." : "Save"}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

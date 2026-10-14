"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Search,
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Plus,
  Minus,
  History,
  X,
  FileSpreadsheet,
} from "lucide-react";

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

interface InventoryMovementRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  changeType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  adminName: string;
  createdAt: string;
}

export function InventoryClient({
  initialProducts,
  initialMovements,
}: {
  initialProducts: InventoryProduct[];
  initialMovements: InventoryMovementRecord[];
}) {
  const [products, setProducts] = useState<InventoryProduct[]>(initialProducts);
  const [movements, setMovements] = useState<InventoryMovementRecord[]>(initialMovements);
  const [activeTab, setActiveTab] = useState<"STOCK" | "HISTORY">("STOCK");
  const [filter, setFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [search, setSearch] = useState("");

  // Modal State for stock adjustment with reason
  const [modalProduct, setModalProduct] = useState<InventoryProduct | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<"ADD" | "SET">("ADD");
  const [adjustReason, setAdjustReason] = useState<string>("Restock shipment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  const handleOpenAdjust = (p: InventoryProduct, defaultAdd: number = 10) => {
    setModalProduct(p);
    setAdjustQty(defaultAdd);
    setAdjustType("ADD");
    setAdjustReason("Restock shipment");
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProduct) return;

    setIsSubmitting(true);
    try {
      const payload =
        adjustType === "ADD"
          ? {
              productId: modalProduct.id,
              changeQuantity: adjustQty,
              reason: adjustReason,
            }
          : {
              productId: modalProduct.id,
              newStock: adjustQty,
              reason: adjustReason,
            };

      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to adjust stock");
      }

      // Update product list
      setProducts((prev) =>
        prev.map((item) =>
          item.id === modalProduct.id ? { ...item, stock: data.product.stock } : item
        )
      );

      // Add to movements list
      if (data.movement) {
        setMovements((prev) => [
          {
            ...data.movement,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      setSuccessToast(`Stock updated for ${modalProduct.name} (New stock: ${data.product.stock})`);
      setModalProduct(null);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.message || "Error adjusting stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inStockCount = products.filter((p) => p.stock > 5).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Inventory Control & Audit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit stock levels, record shipment restocks with verified reasons, and prevent overselling
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab("STOCK")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "STOCK"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Catalog Stock
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "HISTORY"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movement Audit Log</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {activeTab === "STOCK" ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFilter("IN_STOCK")}
              className={`p-5 rounded-2xl border text-left transition-all ${
                filter === "IN_STOCK"
                  ? "border-emerald-500 bg-emerald-50/60 shadow-xs"
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
                  ? "border-amber-500 bg-amber-50/60 shadow-xs"
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
                  ? "border-rose-500 bg-rose-50/60 shadow-xs"
                  : "bg-white border-slate-200/80 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-rose-700 uppercase">
                <span>Out of Stock</span>
                <Warehouse className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-rose-900 mt-1">{outOfStockCount} SKUs</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Depleted stock (0 units)</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search inventory by product title or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-500 focus:bg-white text-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => {
                setFilter("ALL");
                setSearch("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 shrink-0"
            >
              Reset Filters
            </button>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Product</th>
                    <th className="px-6 py-3.5">SKU</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Stock Level</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Quick Restock / Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No products match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const isLow = p.stock > 0 && p.stock <= 5;
                      const isOut = p.stock === 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative shrink-0">
                                {p.images.length > 0 ? (
                                  <Image
                                    src={p.images[0].url}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Warehouse className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-slate-900 max-w-xs truncate">
                                {p.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-mono text-slate-500 font-bold">{p.sku}</td>
                          <td className="px-6 py-4 text-slate-600">{p.category?.name || "General"}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {formatCurrency(p.salePrice ?? p.regularPrice)}
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-base font-black text-slate-900">{p.stock}</span>{" "}
                            <span className="text-[11px] text-slate-400">units</span>
                          </td>

                          <td className="px-6 py-4">
                            {isOut ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                Low Stock ({p.stock})
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Healthy
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenAdjust(p, 10)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAdjust(p, 25)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                              >
                                +25
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenAdjust(p, 0)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                              >
                                Custom Adjust
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
        </>
      ) : (
        /* Inventory Movements Audit History Tab */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900">Inventory Movement Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable ledger of stock deductions from orders, restocks, and manual adjustments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Product & SKU</th>
                  <th className="px-6 py-3.5">Event Type</th>
                  <th className="px-6 py-3.5">Change</th>
                  <th className="px-6 py-3.5">Stock Shift</th>
                  <th className="px-6 py-3.5">Reason / Note</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No inventory movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">
                            {m.productName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{m.sku}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                            {m.changeType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black">
                          <span
                            className={isPositive ? "text-emerald-600" : "text-rose-600"}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">
                          {m.previousStock} → <span className="font-bold">{m.newStock}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                          {m.reason || "—"}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{m.adminName}</td>
                        <td className="px-6 py-4 text-slate-400">{formatDate(m.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Adjustment Modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black">Adjust Inventory Level</h3>
                <p className="text-[11px] text-slate-400">{modalProduct.name}</p>
              </div>
              <button
                onClick={() => setModalProduct(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between">
                <span className="text-slate-500">Current Stock:</span>
                <span className="font-black text-slate-900">{modalProduct.stock} units</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Adjustment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("ADD")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      adjustType === "ADD"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Add / Restock (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustType("SET");
                      setAdjustQty(modalProduct.stock);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      adjustType === "SET"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Set Exact Total (=)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {adjustType === "ADD" ? "Quantity to Add:" : "New Total Stock:"}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-base font-black text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Adjustment (Audit Required)
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold"
                >
                  <option value="Restock shipment received">Restock shipment received</option>
                  <option value="Supplier purchase return">Supplier purchase return</option>
                  <option value="Damaged / expired goods write-off">Damaged / expired goods write-off</option>
                  <option value="Inventory recount reconciliation">Inventory recount reconciliation</option>
                  <option value="Customer return restocked">Customer return restocked</option>
                  <option value="Promotional giveaway / sample">Promotional giveaway / sample</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30"
                >
                  {isSubmitting ? "Saving..." : "Confirm & Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

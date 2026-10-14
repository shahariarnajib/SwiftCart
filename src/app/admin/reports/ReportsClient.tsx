"use client";

import React, { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  BarChart3,
  Download,
  TrendingUp,
  FileSpreadsheet,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  Percent,
  Truck,
  RotateCcw,
} from "lucide-react";

interface ReportsClientProps {
  initialData: {
    summary: {
      totalOrders: number;
      grossSubtotal: number;
      totalDelivery: number;
      totalDiscounts: number;
      netRevenue: number;
      cancelledVolume: number;
    };
    topProducts: Array<{
      name: string;
      sku: string;
      units: number;
      revenue: number;
    }>;
    recentOrders: Array<{
      id: string;
      orderNumber: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
  };
}

export function ReportsClient({ initialData }: ReportsClientProps) {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const handleDownloadCsv = async (type: "orders" | "products" | "inventory" | "customers") => {
    setDownloadingType(type);
    try {
      window.location.href = `/api/reports/export?type=${type}`;
    } finally {
      setTimeout(() => setDownloadingType(null), 1500);
    }
  };

  const { summary, topProducts } = initialData;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sales & Operational Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial reconciliation, top revenue drivers, and audit-grade CSV exports
          </p>
        </div>
      </div>

      {/* CSV Export Quick Center */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Export Center
            </span>
            <h3 className="text-lg font-black text-white mt-1">Download Business Data (CSV)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Export verified database tables directly into Excel or Google Sheets formatted CSV files
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => handleDownloadCsv("orders")}
            disabled={downloadingType === "orders"}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-brand-500 flex flex-col items-start gap-2 transition-all text-left"
          >
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Orders Ledger</span>
              <span className="text-[10px] text-slate-400">All orders & statuses</span>
            </div>
          </button>

          <button
            onClick={() => handleDownloadCsv("products")}
            disabled={downloadingType === "products"}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500 flex flex-col items-start gap-2 transition-all text-left"
          >
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Product Catalog</span>
              <span className="text-[10px] text-slate-400">SKUs, costs & prices</span>
            </div>
          </button>

          <button
            onClick={() => handleDownloadCsv("inventory")}
            disabled={downloadingType === "inventory"}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500 flex flex-col items-start gap-2 transition-all text-left"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Warehouse className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Inventory Valuations</span>
              <span className="text-[10px] text-slate-400">Current stock units & values</span>
            </div>
          </button>

          <button
            onClick={() => handleDownloadCsv("customers")}
            disabled={downloadingType === "customers"}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 flex flex-col items-start gap-2 transition-all text-left"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Customer Directory</span>
              <span className="text-[10px] text-slate-400">Contacts & lifetime spend</span>
            </div>
          </button>
        </div>
      </div>

      {/* Financial Accounting Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Completed Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Net Store Revenue
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(summary.netRevenue)}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
            Completed order turnover
          </span>
        </div>

        {/* Gross Subtotal */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Gross Catalog Sales
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(summary.grossSubtotal)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            Item merchandise values
          </span>
        </div>

        {/* Delivery Charges Collected */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Delivery Fees Collected
          </span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {formatCurrency(summary.totalDelivery)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            Inside & outside Dhaka
          </span>
        </div>

        {/* Discounts & Promo Deductions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Promo Discounts
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatCurrency(summary.totalDiscounts)}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
            Coupon redemptions
          </span>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <span>Top Performing Products</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Best-selling catalog items ranked by cumulative volume and revenue
          </p>
        </div>

        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No product sales data recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Units Sold</th>
                  <th className="px-6 py-3.5 text-right">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {topProducts.map((p, idx) => (
                  <tr key={p.sku || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{p.sku}</td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">{p.units}</span> units
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-600">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

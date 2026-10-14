"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from "@/lib/format";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Plus,
  Users,
  Eye,
  Calendar,
  Layers,
  Tag,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

interface DashboardData {
  metrics: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalCustomers: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    city: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
    salePrice: number | null;
    regularPrice: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    count: number;
  }>;
  recentLogs: Array<{
    id: string;
    adminName: string;
    action: string;
    entity: string;
    details: string | null;
    createdAt: string;
  }>;
  adminName: string;
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [timeFilter, setTimeFilter] = useState<"ALL" | "MONTH" | "TODAY">("ALL");

  const revenueDisplay =
    timeFilter === "TODAY"
      ? data.metrics.todayRevenue
      : timeFilter === "MONTH"
      ? data.metrics.monthRevenue
      : data.metrics.totalRevenue;

  const ordersDisplay =
    timeFilter === "TODAY" ? data.metrics.todayOrders : data.metrics.totalOrders;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Live Business Dashboard
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Supabase Connected
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">
            Welcome back, {data.adminName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live overview of Swift Cart business operations in Bangladesh. All monetary figures in BDT (৳) and Asia/Dhaka time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Process Orders</span>
          </Link>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Filter Overview Period:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeFilter === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setTimeFilter("MONTH")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeFilter === "MONTH"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter("TODAY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeFilter === "TODAY"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {timeFilter === "TODAY" ? "Revenue Today" : timeFilter === "MONTH" ? "Revenue This Month" : "Total Net Sales"}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(revenueDisplay)}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              Excluding cancelled orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {timeFilter === "TODAY" ? "Orders Today" : "Total Orders"}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{ordersDisplay}</div>
            <span className="text-[11px] font-semibold text-brand-600 mt-1 block">
              {data.metrics.pendingOrders} pending confirmation
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Live Products
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {data.metrics.totalProducts}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              In store catalog
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Stock Warnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stock Warnings
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {data.metrics.lowStockProducts + data.metrics.outOfStockProducts}
            </div>
            <span className="text-[11px] font-semibold text-rose-500 mt-1 block">
              {data.metrics.outOfStockProducts} out of stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Order Pipeline Status Distribution
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/orders?status=PENDING"
            className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-900 mt-1">
              {data.metrics.pendingOrders}
            </div>
          </Link>

          <Link
            href="/admin/orders?status=CONFIRMED"
            className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">Confirmed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-900 mt-1">
              {data.metrics.confirmedOrders}
            </div>
          </Link>

          <Link
            href="/admin/orders?status=PROCESSING"
            className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">Processing</span>
              <Package className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-purple-900 mt-1">
              {data.metrics.processingOrders}
            </div>
          </Link>

          <Link
            href="/admin/orders?status=SHIPPED"
            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800">Shipped</span>
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-indigo-900 mt-1">
              {data.metrics.shippedOrders}
            </div>
          </Link>

          <Link
            href="/admin/orders?status=DELIVERED"
            className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Delivered</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-900 mt-1">
              {data.metrics.deliveredOrders}
            </div>
          </Link>

          <Link
            href="/admin/orders?status=CANCELLED"
            className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 hover:border-rose-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">Cancelled</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-900 mt-1">
              {data.metrics.cancelledOrders}
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Low Stock Alert & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Inventory Alerts (Immediate Attention)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Products nearing zero stock or completely depleted
              </p>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Restock</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {data.lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              All inventory levels are healthy!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[10px] text-slate-400">SKU: {item.sku}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        item.stock === 0
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                    </span>
                    <Link
                      href="/admin/inventory"
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                <span>Catalog Category Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Product inventory spread across store categories
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                  {cat.count} products
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live orders placed via the Swift Cart storefront
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No customer orders received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">City</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.recentOrders.map((ord) => {
                  const cfg = ORDER_STATUS_CONFIG[ord.status] || {
                    label: ord.status,
                    bg: "bg-slate-50",
                    color: "text-slate-700",
                    border: "border-slate-200",
                  };
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-600">{ord.orderNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{ord.customerName}</td>
                      <td className="px-6 py-4 text-slate-600">{ord.phone}</td>
                      <td className="px-6 py-4 text-slate-600">{ord.city}</td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/orders?q=${ord.orderNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Admin Audit Logs */}
      {data.recentLogs && data.recentLogs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500" />
                <span>Recent Administrative Activity Audit Log</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tamper-resistant audit logs tracking store configuration, pricing, and order changes
              </p>
            </div>
            <Link
              href="/admin/team"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View Security Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{log.adminName}:</span>{" "}
                  <span className="text-slate-600">{log.action.replace(/_/g, " ")}</span>{" "}
                  <span className="text-slate-400">({log.entity})</span>
                </div>
                <span className="text-slate-400 text-[11px]">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

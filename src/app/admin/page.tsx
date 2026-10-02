import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  // Fetch metrics in parallel
  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalCustomers,
    recentOrders,
    completedOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.customer.count(),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true },
    }),
  ]);

  const totalSales = completedOrders.reduce((sum, ord) => sum + ord.total, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
            Merchant Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Welcome back, {admin.name || admin.username}!</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Here is what&apos;s happening across your Swift Cart store today. Monitor active orders,
            replenish low stock, and manage new listings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {formatCurrency(totalSales)}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">
              Excluding cancelled orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalOrders}</div>
            <span className="text-[11px] font-semibold text-brand-600 mt-1 block">
              {pendingOrders} awaiting review
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Products in Catalog
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalProducts}</div>
            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
              Live in store
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stock Warnings
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {lowStockProducts + outOfStockProducts}
            </div>
            <span className="text-[11px] font-semibold text-rose-500 mt-1 block">
              {outOfStockProducts} out of stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Order Pipeline Status Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/orders?status=PENDING"
            className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-900 mt-1">{pendingOrders}</div>
          </Link>

          <Link
            href="/admin/orders?status=CONFIRMED"
            className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">Confirmed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-900 mt-1">{confirmedOrders}</div>
          </Link>

          <Link
            href="/admin/orders?status=PROCESSING"
            className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800">Processing</span>
              <Package className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-purple-900 mt-1">{processingOrders}</div>
          </Link>

          <Link
            href="/admin/orders?status=SHIPPED"
            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800">Shipped</span>
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-indigo-900 mt-1">{shippedOrders}</div>
          </Link>

          <Link
            href="/admin/orders?status=DELIVERED"
            className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Delivered</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-900 mt-1">{deliveredOrders}</div>
          </Link>

          <Link
            href="/admin/orders?status=CANCELLED"
            className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 hover:border-rose-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">Cancelled</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-900 mt-1">{cancelledOrders}</div>
          </Link>
        </div>
      </div>

      {/* Recent Incoming Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest incoming orders placed through the customer storefront
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

        {recentOrders.length === 0 ? (
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
                {recentOrders.map((ord) => {
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
    </div>
  );
}

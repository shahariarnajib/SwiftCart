"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from "@/lib/format";
import {
  Search,
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Trash2,
} from "lucide-react";

interface OrderItemData {
  id: string;
  productId: string | null;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  area: string | null;
  postalCode: string | null;
  orderNotes: string | null;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string | Date;
  items: OrderItemData[];
}

export function OrdersClient({
  initialOrders,
  defaultStatus,
  defaultQuery,
}: {
  initialOrders: OrderRecord[];
  defaultStatus?: string;
  defaultQuery?: string;
}) {
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState(defaultStatus || "ALL");
  const [search, setSearch] = useState(defaultQuery || "");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== "ALL" && ord.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchName = ord.customerName.toLowerCase().includes(q);
      const matchPhone = ord.phone.includes(q);
      if (!matchNum && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    setStatusSuccessMsg(null);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const updated = await res.json();
      if (!res.ok) {
        alert(updated.error || "Failed to update order status");
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setStatusSuccessMsg(`Order ${updated.orderNumber} updated to ${newStatus}`);
        setTimeout(() => setStatusSuccessMsg(null), 3000);
      }
    } catch {
      alert("Error updating order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to permanently delete this order?")) return;
    setIsDeletingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete order");
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
        setStatusSuccessMsg("Order permanently deleted.");
        setTimeout(() => setStatusSuccessMsg(null), 3000);
      }
    } catch {
      alert("Error deleting order");
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const statusList = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Orders Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming orders, verify customer addresses, and update parcel delivery statuses
          </p>
        </div>
      </div>

      {statusSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search by Order ID (SC-...), customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status filter tabs / dropdown */}
        <div className="w-full md:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-slate-700 font-bold"
          >
            <option value="ALL">All Order Statuses</option>
            {statusList.map((st) => (
              <option key={st} value={st}>
                {ORDER_STATUS_CONFIG[st]?.label || st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No orders matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const cfg = ORDER_STATUS_CONFIG[ord.status] || {
                    label: ord.status,
                    bg: "bg-slate-50",
                    color: "text-slate-700",
                    border: "border-slate-200",
                  };

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-600">{ord.orderNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{ord.customerName}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{ord.phone}</td>
                      <td className="px-6 py-4 text-slate-600">{ord.city}</td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        {formatCurrency(ord.total)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ord.status}
                          disabled={isUpdatingStatus}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          {statusList.map((st) => (
                            <option key={st} value={st}>
                              {ORDER_STATUS_CONFIG[st]?.label || st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(ord.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/orders/${ord.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold transition-colors"
                          >
                            <span>Manage</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Quick View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Order Details Slide-over / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Order Details
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedOrder.orderNumber}</h3>
                <span className="text-xs text-slate-400">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector in Modal */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Manage Status:</span>
                <span className="text-[11px] text-slate-400">
                  Changing status updates order history immediately
                </span>
              </div>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-brand-500 shadow-sm"
              >
                {statusList.map((st) => (
                  <option key={st} value={st}>
                    {ORDER_STATUS_CONFIG[st]?.label || st}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer & Delivery Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Customer Information
                </span>
                <p className="text-sm font-bold text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedOrder.phone}</span>
                </p>
                {selectedOrder.email && (
                  <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.email}</p>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Delivery Destination
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedOrder.address}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  {selectedOrder.area ? `${selectedOrder.area}, ` : ""}
                  {selectedOrder.city} {selectedOrder.postalCode ? `- ${selectedOrder.postalCode}` : ""}
                </p>
                <div className="mt-2 text-[11px] font-bold text-brand-600">
                  Payment: {selectedOrder.paymentMethod}
                </div>
              </div>
            </div>

            {selectedOrder.orderNotes && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Customer Notes:</span> {selectedOrder.orderNotes}
              </div>
            )}

            {/* Products Snapshot */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Purchased Items ({selectedOrder.items.length})
              </span>
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          SKU: {item.productSku} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-[10px] text-slate-400">({formatCurrency(item.price)} each)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">
                  {selectedOrder.deliveryCharge === 0 ? "Free" : formatCurrency(selectedOrder.deliveryCharge)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-sm">
                <span className="font-black text-slate-900">Total Charged</span>
                <span className="text-lg font-black text-brand-600">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Order Drawer Action Bar */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Link
                href={`/admin/orders/${selectedOrder.id}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                View Full Invoice & Details →
              </Link>
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                disabled={isDeletingOrder}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

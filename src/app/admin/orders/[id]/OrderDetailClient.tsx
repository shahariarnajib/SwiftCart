"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from "@/lib/format";
import { InvoiceModal } from "./InvoiceModal";
import {
  ArrowLeft,
  Printer,
  Save,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  AlertTriangle,
  RotateCcw,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface OrderDetailClientProps {
  order: any;
}

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || "PENDING");
  const [deliveryProvider, setDeliveryProvider] = useState(order.deliveryProvider || "Steadfast Courier");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || "");
  const [statusNote, setStatusNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ];

  const handleUpdate = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          paymentStatus,
          deliveryProvider,
          trackingNumber,
          internalNotes,
          statusNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order");
      }

      setOrder(data);
      setStatus(data.status);
      setPaymentStatus(data.paymentStatus);
      setStatusNote("");
      setSuccessMessage("Order updated successfully!");
      router.refresh();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  const currentCfg = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    bg: "bg-slate-50",
    color: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Order {order.orderNumber}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${currentCfg.bg} ${currentCfg.color} ${currentCfg.border}`}
              >
                {currentCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {formatDate(order.createdAt)} via Web Checkout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Invoice & Packing Slip</span>
          </button>
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all active:scale-95"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Pricing Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ordered Items Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              <span>Ordered Products ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {item.productName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        SKU: {item.productSku}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal Calculation */}
            <div className="pt-6 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.deliveryCharge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Amount:</span>
                <span className="text-brand-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>Customer Profile</span>
              </h4>
              <div>
                <p className="text-sm font-black text-slate-900">{order.customerName}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{order.phone}</span>
                </p>
                {order.email && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{order.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Delivery Destination</span>
              </h4>
              <p className="text-xs font-semibold text-slate-800">{order.address}</p>
              <p className="text-xs text-slate-600">
                {order.city} {order.area ? `, ${order.area}` : ""} {order.postalCode ? `- ${order.postalCode}` : ""}
              </p>
              {order.orderNotes && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 italic">
                  &ldquo;{order.orderNotes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Order Status History Audit Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Status History Audit Timeline</span>
            </h3>

            {order.statusHistory?.length === 0 ? (
              <p className="text-xs text-slate-400">No status changes recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {order.statusHistory?.map((h: any, idx: number) => (
                  <div key={h.id || idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0"></div>
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {h.fromStatus} → {h.toStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          by {h.changedBy}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {formatDate(h.createdAt)}
                        </span>
                      </div>
                      {h.note && <p className="text-slate-500 mt-0.5">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & Fulfillment Actions (1 col) */}
        <div className="space-y-6">
          {/* Order Status Controller Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Fulfillment Status</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Current Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Reason / Status Update Note (Optional)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Package dispatched via Steadfast tracking #12345"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Payment Details</span>
            </h3>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Payment Collection Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="PENDING">Pending Collection (COD)</option>
                <option value="PAID">Collected & Verified (Paid)</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FAILED">Payment Failed</option>
              </select>
            </div>
          </div>

          {/* Courier & Shipment Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Shipping & Delivery</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Delivery Courier Provider
              </label>
              <select
                value={deliveryProvider}
                onChange={(e) => setDeliveryProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              >
                <option value="Steadfast Courier">Steadfast Courier</option>
                <option value="Pathao Courier">Pathao Courier</option>
                <option value="RedX Logistics">RedX Logistics</option>
                <option value="Paperfly">Paperfly</option>
                <option value="In-house Swift Delivery">In-house Swift Delivery</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Courier Tracking ID / Consignment #
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. SF-94827104"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          {/* Internal Admin Notes */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Internal Admin Notes (Private)</span>
            </h3>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private notes visible only to store operators..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>
      </div>

      <InvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
}

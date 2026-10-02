import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, ORDER_STATUS_CONFIG } from "@/lib/format";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  ArrowRight,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ orderNumber: params.orderNumber }, { id: params.orderNumber }],
    },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!order) {
    notFound();
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Order Confirmed
          </span>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-2">
            Thank you, {order.customerName}!
          </h1>

          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Your order has been recorded in our system. Our team is preparing your package for
            dispatch. You will receive an SMS or call before delivery.
          </p>

          {/* Quick Highlights Box */}
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Order ID</span>
              <span className="text-sm font-extrabold text-brand-600">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Date</span>
              <span className="text-xs font-bold text-slate-800">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Payment</span>
              <span className="text-xs font-bold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Status</span>
              <span
                className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
              >
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details & Items Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 mb-8 print:border-none print:shadow-none">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" />
              <span>Ordered Products ({order.items.length})</span>
            </h2>
            <PrintButton />
          </div>

          {/* Item Rows */}
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{item.productName}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    SKU: {item.productSku} • Qty: {item.quantity}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    ({formatCurrency(item.price)} each)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Address Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Delivery Address</span>
              </h3>
              <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{order.address}</p>
              <p className="text-xs text-slate-600">
                {order.area ? `${order.area}, ` : ""}
                {order.city} {order.postalCode ? `- ${order.postalCode}` : ""}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.phone}</span>
              </div>
              {order.orderNotes && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                  <span className="font-bold">Customer Note:</span> {order.orderNotes}
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">
                  {order.deliveryCharge === 0 ? "Free" : formatCurrency(order.deliveryCharge)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-base">Total Payable</span>
                <span className="text-xl font-black text-brand-600">{formatCurrency(order.total)}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                * Payment method: <strong>{order.paymentMethod}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all active:scale-95"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/contact"
            className="text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            Need help with this order? Contact Swift Cart Support
          </Link>
        </div>
      </div>
    </div>
  );
}

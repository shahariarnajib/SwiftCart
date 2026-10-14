"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Printer, X } from "lucide-react";

interface InvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-full">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-brand-400">
              Printable Invoice & Packing Slip
            </span>
            <span className="text-xs text-slate-400">({order.orderNumber})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-12 text-slate-800 space-y-8 print:p-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-base">
                  SC
                </div>
                <span className="text-2xl font-black text-slate-900">Swift Cart</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Shop Smarter. Shop Faster.</p>
              <p className="text-xs text-slate-500">Banani, Dhaka-1213, Bangladesh</p>
              <p className="text-xs text-slate-500">Hotline: +880 1700-000000</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-700 border border-brand-200 uppercase tracking-widest">
                INVOICE
              </span>
              <div className="text-lg font-black text-slate-900 mt-2">{order.orderNumber}</div>
              <p className="text-xs text-slate-500">Date: {formatDate(order.createdAt)}</p>
              <p className="text-xs text-slate-500">Payment: {order.paymentMethod}</p>
              <p className="text-xs font-bold text-slate-700 mt-1">
                Status: <span className="uppercase">{order.status}</span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Customer Details
              </span>
              <p className="text-sm font-black text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">Phone: {order.phone}</p>
              {order.email && <p className="text-slate-600">Email: {order.email}</p>}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Delivery Address
              </span>
              <p className="font-semibold text-slate-800">{order.address}</p>
              <p className="text-slate-600 mt-0.5">
                {order.city} {order.area ? `, ${order.area}` : ""} {order.postalCode ? `- ${order.postalCode}` : ""}
              </p>
              {order.orderNotes && (
                <p className="text-slate-500 italic mt-1">Note: &ldquo;{order.orderNotes}&rdquo;</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.productName}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{item.productSku}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-bold">{formatCurrency(order.deliveryCharge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="text-brand-600">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-600">Thank you for shopping with Swift Cart!</p>
              <p>For inquiries: support@swiftcart.com.bd | www.swiftcart.com.bd</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-300 pb-1 mb-1"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

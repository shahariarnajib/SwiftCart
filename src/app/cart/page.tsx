"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCurrency, getSafeImageUrl } from "@/lib/format";
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryCharge,
    deliveryZone,
    setDeliveryZone,
    total,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-slate-50/50 min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-sm max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Your Cart is Empty</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Looks like you haven&apos;t added any items to your shopping cart yet. Discover our top
            tech gadgets and trending gear.
          </p>
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all active:scale-95"
          >
            <span>Start Shopping Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Shopping Cart</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {items.length} {items.length === 1 ? "distinct item" : "distinct items"} in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {items.map((item) => {
                return (
                  <div
                    key={item.productId}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200"
                    >
                      <Image
                        src={getSafeImageUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-slate-400 block mt-0.5">SKU: {item.sku}</span>
                      <div className="text-xs font-bold text-slate-700 mt-1 sm:hidden">
                        Unit Price: {formatCurrency(item.price)}
                      </div>
                    </div>

                    {/* Unit Price (Desktop) */}
                    <div className="hidden sm:block text-right">
                      <span className="text-xs text-slate-400 block">Unit Price</span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 font-bold text-slate-900 text-xs sm:text-sm min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1.5 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[90px]">
                      <span className="text-xs text-slate-400 block sm:hidden">Subtotal</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-slate-400 hover:text-brand-600 transition-colors rounded-xl hover:bg-slate-50"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Delivery Guarantee Notice */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3 text-xs text-slate-600">
              <Truck className="w-5 h-5 text-brand-600 shrink-0" />
              <span>
                Free express delivery automatically applied for total orders exceeding ৳2,500 anywhere
                in Bangladesh!
              </span>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              {/* Delivery Zone Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Delivery Destination</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryZone("inside_dhaka")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      deliveryZone === "inside_dhaka"
                        ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div>Inside City</div>
                    <div className="text-[10px] font-normal text-slate-500">৳60 / 24-48 hrs</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryZone("outside_dhaka")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      deliveryZone === "outside_dhaka"
                        ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div>Outside City</div>
                    <div className="text-[10px] font-normal text-slate-500">৳120 / 3-5 days</div>
                  </button>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="font-bold text-emerald-600 uppercase text-xs">Free</span>
                    ) : (
                      <span className="font-bold text-slate-900">{formatCurrency(deliveryCharge)}</span>
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-brand-600">{formatCurrency(total)}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  * Payable in Cash upon delivery. All prices include applicable taxes.
                </p>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30 transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Safe & Secure Checkout • Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

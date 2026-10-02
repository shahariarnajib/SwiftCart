"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertCircle,
  Banknote,
  Smartphone,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    subtotal,
    deliveryCharge,
    deliveryZone,
    setDeliveryZone,
    total,
  } = useCart();

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    city: "Dhaka",
    area: "",
    postalCode: "",
    orderNotes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If cart is empty, redirect or prompt
  if (items.length === 0) {
    return (
      <div className="bg-slate-50/50 min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-sm max-w-md w-full">
          <h2 className="text-xl font-black text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-xs text-slate-500 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto toggle delivery zone if city is Dhaka vs outside
    if (name === "city") {
      if (value.toLowerCase().includes("dhaka")) {
        setDeliveryZone("inside_dhaka");
      } else {
        setDeliveryZone("outside_dhaka");
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!formData.customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const phoneClean = formData.phone.trim().replace(/\D/g, "");
    if (phoneClean.length < 10) {
      setErrorMessage("Please enter a valid Bangladeshi phone number (e.g. 01712345678).");
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage("Please enter your detailed delivery address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        area: formData.area,
        postalCode: formData.postalCode,
        orderNotes: formData.orderNotes,
        deliveryZone,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order. Please try again.");
      }

      // Order created successfully! Clear cart & redirect
      clearCart();
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while placing your order.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-brand-600 transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Checkout</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout & Order Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete your order below. No online payment required; pay cash when your parcel arrives!
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Info Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Contact & Shipping Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Delivery Information</span>
                </h2>
                <span className="text-xs text-slate-400 font-medium">* Required fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. Md. Sajedul Alam"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Phone Number (Active for delivery) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                {/* Full Address */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Detailed Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    placeholder="House number, road number, flat/floor, building name..."
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
                  ></textarea>
                </div>

                {/* City */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white font-medium"
                  >
                    <option value="Dhaka">Dhaka (Metro)</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Gazipur">Gazipur</option>
                    <option value="Narayanganj">Narayanganj</option>
                    <option value="Other">Other District</option>
                  </select>
                </div>

                {/* Area / Thana */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Area / Thana (Optional)
                  </label>
                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Banani / Gulshan / Mirpur"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="e.g. 1213"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                {/* Delivery Zone Toggle */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Delivery Zone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone("inside_dhaka")}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        deliveryZone === "inside_dhaka"
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      Inside Dhaka (৳60)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryZone("outside_dhaka")}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        deliveryZone === "outside_dhaka"
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      Outside Dhaka (৳120)
                    </button>
                  </div>
                </div>

                {/* Order Notes */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Order Notes / Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="orderNotes"
                    rows={2}
                    placeholder="e.g. Please deliver after 3 PM or call before arrival..."
                    value={formData.orderNotes}
                    onChange={handleChange}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Payment Method</span>
                </h2>
              </div>

              {/* Cash on Delivery Selection */}
              <div className="border-2 border-brand-600 bg-brand-50/40 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-brand-600 flex items-center justify-center bg-white mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-brand-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      Cash on Delivery (COD)
                    </span>
                    <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Popular
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Pay with physical cash directly to the delivery person once you inspect your
                    package.
                  </p>
                </div>
              </div>

              {/* Additional Gateway Placeholders (Cleanly disabled for future activation) */}
              <div className="border border-dashed border-slate-200 rounded-2xl p-4 flex items-center justify-between opacity-60 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-700">
                      bKash / Nagad / Online Cards
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Instant mobile banking & debit/credit cards
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Review */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Order Review ({items.length} {items.length === 1 ? "item" : "items"})
              </h2>

              {/* Mini Item List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.productId} className="flex items-center gap-3 py-2 border-b border-slate-50">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                      <Image src={it.image} alt={it.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{it.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Qty: {it.quantity} × {formatCurrency(it.price)}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatCurrency(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-sm border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    Delivery ({deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})
                  </span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="font-bold text-emerald-600 uppercase text-xs">Free</span>
                    ) : (
                      <span className="font-bold text-slate-900">{formatCurrency(deliveryCharge)}</span>
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-black text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-brand-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30 transition-all ${
                  isSubmitting
                    ? "bg-brand-400 text-white cursor-wait"
                    : "bg-brand-600 hover:bg-brand-700 text-white active:scale-95"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming Order...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order (Cash on Delivery)</span>
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No payment required right now</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>Verified parcel tracking & dispatch confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>7-Day Hassle-Free Replacement Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

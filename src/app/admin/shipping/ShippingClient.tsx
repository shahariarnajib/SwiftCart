"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { Truck, Save, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink } from "lucide-react";

export interface ShippingSettings {
  delivery_inside_dhaka?: string;
  delivery_outside_dhaka?: string;
  free_shipping_threshold?: string;
  courier_provider_default?: string;
  [key: string]: string | undefined;
}

export function ShippingClient({ initialSettings }: { initialSettings: ShippingSettings }) {
  const [insideDhaka, setInsideDhaka] = useState(initialSettings.delivery_inside_dhaka || "60");
  const [outsideDhaka, setOutsideDhaka] = useState(initialSettings.delivery_outside_dhaka || "120");
  const [freeThreshold, setFreeThreshold] = useState(initialSettings.free_shipping_threshold || "2500");
  const [defaultCourier, setDefaultCourier] = useState(
    initialSettings.courier_provider_default || "Steadfast Courier"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMsg(null);

    try {
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_inside_dhaka: insideDhaka,
          delivery_outside_dhaka: outsideDhaka,
          free_shipping_threshold: freeThreshold,
          courier_provider_default: defaultCourier,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setToastMsg("Shipping and delivery fee settings updated successfully!");
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Shipping & Delivery Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage city delivery rates, nationwide shipping fees, free shipping incentives, and courier logistics
        </p>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Delivery Rates Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-600" />
            <span>Delivery Fee Schedule (BDT ৳)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Inside Dhaka City Delivery Fee (৳) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  value={insideDhaka}
                  onChange={(e) => setInsideDhaka(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default express delivery fee within Dhaka metro.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Outside Dhaka / Nationwide Delivery Fee (৳) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  value={outsideDhaka}
                  onChange={(e) => setOutsideDhaka(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Nationwide parcel courier fee across all 64 districts.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Free Express Delivery Threshold (৳)
            </label>
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ৳
              </span>
              <input
                type="number"
                min="0"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cart subtotals exceeding this amount automatically receive ৳0 delivery charge.
            </p>
          </div>
        </div>

        {/* Courier Logistic Partners Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Courier Integration & Fulfillment</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Default Courier Provider
            </label>
            <select
              value={defaultCourier}
              onChange={(e) => setDefaultCourier(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-800"
            >
              <option value="Steadfast Courier">Steadfast Courier (Recommended for BD)</option>
              <option value="Pathao Courier">Pathao Courier</option>
              <option value="RedX Logistics">RedX Logistics</option>
              <option value="Paperfly">Paperfly</option>
              <option value="In-house Swift Delivery">In-house Swift Delivery</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <span className="font-bold text-slate-900">Steadfast Courier Integration</span>
              <p className="text-slate-500">API Boundary ready for consignment booking & webhook tracking.</p>
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Active in Order View
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <span className="font-bold text-slate-900">Pathao Logistics</span>
              <p className="text-slate-500">Fast on-demand delivery for Dhaka, Chittagong, and Sylhet.</p>
              <span className="inline-block text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                Configured
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all active:scale-95"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Shipping Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

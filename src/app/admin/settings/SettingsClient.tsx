"use client";

import React, { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Store, Truck, Phone, Settings } from "lucide-react";

interface SettingsMap {
  [key: string]: string;
}

export function SettingsClient({ initialSettings }: { initialSettings: SettingsMap }) {
  const [settings, setSettings] = useState<SettingsMap>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      alert("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Store Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure store branding, contact information, and delivery parameters
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Brand Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Brand & Store Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Name</label>
              <input
                type="text"
                value={settings["store_name"] || "Swift Cart"}
                onChange={(e) => handleChange("store_name", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Store Tagline</label>
              <input
                type="text"
                value={settings["store_tagline"] || "Shop Smarter. Shop Faster."}
                onChange={(e) => handleChange("store_tagline", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Currency Code</label>
              <input
                type="text"
                value={settings["currency_code"] || "BDT"}
                onChange={(e) => handleChange("currency_code", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings["currency_symbol"] || "৳"}
                onChange={(e) => handleChange("currency_symbol", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Delivery Fees & Thresholds (Bangladesh)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Inside Dhaka Charge (৳)
              </label>
              <input
                type="number"
                value={settings["delivery_inside_dhaka"] || "60"}
                onChange={(e) => handleChange("delivery_inside_dhaka", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Outside Dhaka Charge (৳)
              </label>
              <input
                type="number"
                value={settings["delivery_outside_dhaka"] || "120"}
                onChange={(e) => handleChange("delivery_outside_dhaka", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Free Delivery Above (৳)
              </label>
              <input
                type="number"
                value={settings["free_delivery_threshold"] || "2500"}
                onChange={(e) => handleChange("free_delivery_threshold", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Contact & Fulfillment Warehouse
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Support Phone / Hotline
              </label>
              <input
                type="text"
                value={settings["contact_phone"] || "+880 1712-345678"}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={settings["contact_email"] || "support@swiftcart.com"}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Warehouse / Office Physical Address
              </label>
              <textarea
                rows={2}
                value={
                  settings["store_address"] ||
                  "House 42, Road 11, Banani, Dhaka-1213, Bangladesh"
                }
                onChange={(e) => handleChange("store_address", e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:border-brand-500 resize-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

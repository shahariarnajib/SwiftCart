"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/format";
import {
  Globe,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Megaphone,
  Save,
  Image as ImageIcon,
} from "lucide-react";

interface BannerItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  section: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export function ContentClient({
  initialBanners,
  initialAnnouncement,
}: {
  initialBanners: BannerItem[];
  initialAnnouncement: string;
}) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [isSavingAnnounce, setIsSavingAnnounce] = useState(false);
  const [announceToast, setAnnounceToast] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonLink, setButtonLink] = useState("/shop");
  const [imageUrl, setImageUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setTitle("");
    setSubtitle("");
    setBadge("NEW COLLECTION");
    setButtonText("Shop Now");
    setButtonLink("/shop");
    setImageUrl("");
    setOrderIndex(banners.length + 1);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || "");
    setBadge(b.badge || "");
    setButtonText(b.buttonText || "Shop Now");
    setButtonLink(b.buttonLink || "/shop");
    setImageUrl(b.imageUrl);
    setOrderIndex(b.orderIndex);
    setIsActive(b.isActive);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge: badge.trim() || null,
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        imageUrl: imageUrl.trim(),
        orderIndex: Number(orderIndex),
        isActive,
      };

      const url = editingBanner ? `/api/banners/${editingBanner.id}` : "/api/banners";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save banner");

      if (editingBanner) {
        setBanners((prev) =>
          prev.map((item) => (item.id === editingBanner.id ? { ...item, ...data } : item))
        );
        setToastMsg("Banner updated successfully!");
      } else {
        setBanners((prev) => [...prev, data]);
        setToastMsg("New banner published successfully!");
      }

      setIsModalOpen(false);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (b: BannerItem) => {
    if (!confirm(`Are you sure you want to delete banner "${b.title}"?`)) return;

    try {
      const res = await fetch(`/api/banners/${b.id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((item) => item.id !== b.id));
      }
    } catch {
      alert("Error deleting banner");
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnounce(true);
    setAnnounceToast(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement_text: announcement }),
      });

      if (!res.ok) throw new Error("Failed to save announcement bar");
      setAnnounceToast("Announcement bar updated on storefront!");
      setTimeout(() => setAnnounceToast(null), 3000);
    } catch {
      alert("Error updating announcement bar");
    } finally {
      setIsSavingAnnounce(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Website Content & Banners
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage homepage promotional banners, hero sliders, announcement bars, and policy pages
        </p>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Announcement Bar Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-black text-slate-900">
          <Megaphone className="w-4 h-4 text-brand-600" />
          <span>Top Announcement Bar</span>
        </div>
        <p className="text-xs text-slate-400">
          Displays at the very top of all customer storefront pages for nationwide alerts or free shipping notices.
        </p>

        <form onSubmit={handleSaveAnnouncement} className="flex gap-3">
          <input
            type="text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="e.g. 🔥 Free express delivery across Bangladesh on orders over ৳2,500!"
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={isSavingAnnounce}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all shrink-0"
          >
            {isSavingAnnounce ? "Saving..." : "Update Bar"}
          </button>
        </form>

        {announceToast && (
          <p className="text-xs text-emerald-600 font-semibold">{announceToast}</p>
        )}
      </div>

      {/* Hero Banners Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-600" />
              <span>Homepage Hero Slides & Banners ({banners.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High-impact promotional sliders with headline copy and call-to-action buttons
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No banners published yet. Click &ldquo;Add Banner&rdquo; to create your first hero slide.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between bg-slate-50/50"
              >
                <div className="relative h-44 w-full bg-slate-900">
                  <Image src={b.imageUrl} alt={b.title} fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end text-white">
                    {b.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-400">
                        {b.badge}
                      </span>
                    )}
                    <h4 className="text-base font-black leading-tight line-clamp-1">{b.title}</h4>
                    {b.subtitle && (
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{b.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {b.isActive ? "Live on Store" : "Hidden"}
                    </span>
                    <span className="text-[11px] text-slate-400">Order: #{b.orderIndex}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner Create & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-black">
                {editingBanner ? "Edit Hero Banner" : "Create Hero Banner"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Next-Gen Sound & Audio Gear"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Experience unmatched clarity with official warranty"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. LIMITED TIME OFFER"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Link
                  </label>
                  <input
                    type="text"
                    value={buttonLink}
                    onChange={(e) => setButtonLink(e.target.value)}
                    placeholder="/shop or /category/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Banner Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Supabase Storage URL"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span>Active & Visible</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30"
                  >
                    {isSubmitting ? "Saving..." : editingBanner ? "Update Banner" : "Publish Banner"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

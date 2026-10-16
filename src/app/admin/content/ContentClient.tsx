"use client";

import React, { useState, useRef } from "react";
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
  UploadCloud,
  Loader2,
  ExternalLink,
  Eye,
  User,
  Quote,
  Sparkles,
  BookOpen,
  Mail,
  Linkedin,
  Facebook,
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
  initialSettings = {},
}: {
  initialBanners: BannerItem[];
  initialAnnouncement: string;
  initialSettings?: Record<string, string>;
}) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [isSavingAnnounce, setIsSavingAnnounce] = useState(false);
  const [announceToast, setAnnounceToast] = useState<string | null>(null);

  // Founder Section State
  const [founderName, setFounderName] = useState(
    initialSettings["founder_name"] || "Md. Sajedul Alam"
  );
  const [founderRole, setFounderRole] = useState(
    initialSettings["founder_role"] || "Founder & CEO, Swift Cart"
  );
  const [founderImage, setFounderImage] = useState(
    initialSettings["founder_image"] ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  );
  const [founderBadge, setFounderBadge] = useState(
    initialSettings["founder_badge"] || "Established 2024 • Chittagong, BD"
  );
  const [founderBio, setFounderBio] = useState(
    initialSettings["founder_bio"] ||
      "Tech entrepreneur and e-commerce innovator passionate about authentic consumer electronics and dependable fulfillment in Bangladesh."
  );
  const [founderQuote, setFounderQuote] = useState(
    initialSettings["founder_quote"] ||
      "We didn't build Swift Cart just to sell products; we built it to restore trust, authenticity, and speed to online shopping across all 64 districts in Bangladesh."
  );
  const [founderStory, setFounderStory] = useState(
    initialSettings["founder_story"] ||
      "The idea for Swift Cart began in Chawkbazar, Chittagong. Like thousands of shoppers across Bangladesh, I was constantly frustrated by online orders that arrived late, lacked official warranties, or were grey-market replicas.\n\nI believed Bangladeshi consumers deserved a store they could trust without second thought: a platform that inspects every product serial number, partners with official warranty distributors, and dispatches parcels with Cash on Delivery in 24-48 hours.\n\nFrom our fulfillment center in Chittagong, we have built Swift Cart into a platform built on speed, authenticity, and unwavering customer care."
  );
  const [founderVision, setFounderVision] = useState(
    initialSettings["founder_vision"] ||
      "To be Bangladesh's most reliable e-commerce store where speed, authenticity, and customer happiness are non-negotiable standards."
  );
  const [founderLinkedin, setFounderLinkedin] = useState(
    initialSettings["founder_linkedin"] || "https://linkedin.com"
  );
  const [founderEmail, setFounderEmail] = useState(
    initialSettings["founder_email"] || "founder@swiftcart.com"
  );
  const [founderFacebook, setFounderFacebook] = useState(
    initialSettings["founder_facebook"] || "https://facebook.com/swiftcartbd"
  );

  const [isSavingFounder, setIsSavingFounder] = useState(false);
  const [founderToast, setFounderToast] = useState<string | null>(null);
  const [isUploadingFounderImage, setIsUploadingFounderImage] = useState(false);
  const [founderUploadError, setFounderUploadError] = useState<string | null>(null);
  const founderFileInputRef = useRef<HTMLInputElement>(null);

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

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFounderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const tempBlobUrl = URL.createObjectURL(file);
    // Instant local preview in UI (0ms latency)
    setFounderImage(tempBlobUrl);

    setIsUploadingFounderImage(true);
    setFounderUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "banners");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload founder photo.");
      }

      const uploadedUrl = data.url || data.urls?.[0];
      if (uploadedUrl) {
        setFounderImage(uploadedUrl);
      }
    } catch (err: any) {
      console.warn("Founder upload to server failed, falling back to base64 preview:", err);
      try {
        const b64 = await fileToBase64(file);
        setFounderImage(b64);
        setFounderUploadError("Notice: Storage server notice, photo kept as local preview.");
      } catch {
        setFounderUploadError(err.message || "Failed to upload founder photo.");
      }
    } finally {
      setIsUploadingFounderImage(false);
      if (e.target) e.target.value = "";
      if (founderFileInputRef.current) {
        founderFileInputRef.current.value = "";
      }
    }
  };

  const handleSaveFounder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFounder(true);
    setFounderToast(null);

    try {
      let finalFounderImage = founderImage.trim();
      // If still a temporary blob URL, resolve to Base64
      if (finalFounderImage.startsWith("blob:")) {
        try {
          const blobRes = await fetch(finalFounderImage);
          const blobData = await blobRes.blob();
          finalFounderImage = await fileToBase64(
            new File([blobData], "founder.jpg", { type: blobData.type || "image/jpeg" })
          );
        } catch (b64Err) {
          console.error("Failed to convert founder blob to base64:", b64Err);
        }
      }

      const payload = {
        founder_name: founderName.trim(),
        founder_role: founderRole.trim(),
        founder_image: finalFounderImage,
        founder_badge: founderBadge.trim(),
        founder_bio: founderBio.trim(),
        founder_quote: founderQuote.trim(),
        founder_story: founderStory.trim(),
        founder_vision: founderVision.trim(),
        founder_linkedin: founderLinkedin.trim(),
        founder_email: founderEmail.trim(),
        founder_facebook: founderFacebook.trim(),
      };

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save founder profile");

      setFounderToast("Founder profile & story updated on About Us page!");
      setTimeout(() => setFounderToast(null), 4000);
    } catch (err: any) {
      alert(err.message || "Error saving founder profile");
    } finally {
      setIsSavingFounder(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const tempBlobUrl = URL.createObjectURL(file);
    // Instant local preview
    setImageUrl(tempBlobUrl);

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "banners");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload banner image.");
      }

      const uploadedUrl = data.url || data.urls?.[0];
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      }
    } catch (err: any) {
      console.warn("Banner upload to server failed, falling back to base64 preview:", err);
      try {
        const b64 = await fileToBase64(file);
        setImageUrl(b64);
      } catch {
        setUploadError(err.message || "Failed to upload banner image.");
      }
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
    setUploadError(null);
    setIsUploading(false);
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
    setUploadError(null);
    setIsUploading(false);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setErrorMsg("Please upload or provide an image for the banner.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalBannerImage = imageUrl.trim();
      if (finalBannerImage.startsWith("blob:")) {
        try {
          const blobRes = await fetch(finalBannerImage);
          const blobData = await blobRes.blob();
          finalBannerImage = await fileToBase64(
            new File([blobData], "banner.jpg", { type: blobData.type || "image/jpeg" })
          );
        } catch (b64Err) {
          console.error("Failed to convert banner blob to base64:", b64Err);
        }
      }

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge: badge.trim() || null,
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        imageUrl: finalBannerImage,
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
      {/* Title & Quick Jump Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Website Content & Banners
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage homepage promotional banners, hero sliders, announcement bars, and founder story
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="#banners"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 text-xs font-bold shadow-xs hover:border-brand-200 transition-colors"
          >
            Hero Banners
          </a>
          <a
            href="#founder"
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Founder & About Us</span>
          </a>
        </div>
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
      <div id="banners" className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 scroll-mt-6">
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
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover opacity-85" />
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

      {/* Founder Profile & Brand Story (About Us Page) */}
      <div id="founder" className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6 scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Founder Profile & Story Behind Swift Cart (About Us Page)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage founder portrait photo, leadership bio, quote, and brand origin narrative
            </p>
          </div>

          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
          >
            <span>Preview About Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {founderToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{founderToast}</span>
          </div>
        )}

        <form onSubmit={handleSaveFounder} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Founder Photo Column */}
            <div className="lg:col-span-4 space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Founder Portrait Photo *
              </label>

              {founderUploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{founderUploadError}</span>
                </div>
              )}

              {founderImage ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs space-y-0">
                  <div className="relative h-60 w-full overflow-hidden bg-slate-800">
                    <img
                      src={founderImage}
                      alt={founderName}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                      <span className="text-[10px] font-bold text-white bg-brand-600/90 px-2 py-0.5 rounded-md">
                        {founderBadge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <label className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFounderImageUpload}
                            className="sr-only"
                            disabled={isUploadingFounderImage}
                          />
                          <UploadCloud className="w-3 h-3" />
                          <span>Replace</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setFounderImage("")}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] font-mono text-slate-500 truncate">
                    {founderImage}
                  </div>
                </div>
              ) : (
                <label
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 block select-none ${
                    isUploadingFounderImage
                      ? "border-brand-400 bg-brand-50/50 cursor-wait"
                      : "border-slate-300 hover:border-brand-500 hover:bg-brand-50/20 bg-slate-50/50"
                  }`}
                >
                  <input
                    ref={founderFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFounderImageUpload}
                    className="sr-only"
                    disabled={isUploadingFounderImage}
                  />
                  {isUploadingFounderImage ? (
                    <>
                      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                      <span className="text-xs font-bold text-brand-700">Uploading photo...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Click to upload founder photo
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          JPG, PNG, WEBP, GIF up to 10MB
                        </p>
                      </div>
                      <span className="mt-1 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs inline-block pointer-events-none">
                        Choose Photo
                      </span>
                    </>
                  )}
                </label>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Or specify photo URL directly
                </label>
                <input
                  type="text"
                  value={founderImage}
                  onChange={(e) => setFounderImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/photo.jpg"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Founder Identity & Bio */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Founder Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    placeholder="e.g. Md. Sajedul Alam"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={founderRole}
                    onChange={(e) => setFounderRole(e.target.value)}
                    placeholder="e.g. Founder & CEO, Swift Cart"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Badge / Founding Tagline
                </label>
                <input
                  type="text"
                  value={founderBadge}
                  onChange={(e) => setFounderBadge(e.target.value)}
                  placeholder="e.g. Established 2024 • Chittagong, BD"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Founder Short Bio / Summary
                </label>
                <textarea
                  rows={2}
                  value={founderBio}
                  onChange={(e) => setFounderBio(e.target.value)}
                  placeholder="Brief 1-2 sentence background of the founder..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Founder&apos;s Featured Quote
                </label>
                <textarea
                  rows={2}
                  value={founderQuote}
                  onChange={(e) => setFounderQuote(e.target.value)}
                  placeholder="Personal motto or key quote regarding Swift Cart..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none font-medium italic"
                />
              </div>
            </div>
          </div>

          {/* Full Narrative: The Story Behind Swift Cart */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                The Story Behind Swift Cart (Full Narrative) *
              </label>
              <span className="text-[11px] text-slate-400">
                Separate paragraphs with a blank line
              </span>
            </div>
            <textarea
              rows={6}
              required
              value={founderStory}
              onChange={(e) => setFounderStory(e.target.value)}
              placeholder="Tell the full story of why Swift Cart was founded, the early days in Chittagong, the challenges observed in BD e-commerce, and our commitment to authentic items..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans"
            />
          </div>

          {/* Vision Statement */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Founder Vision & Mission Statement
            </label>
            <textarea
              rows={2}
              value={founderVision}
              onChange={(e) => setFounderVision(e.target.value)}
              placeholder="Our forward-looking vision for online shopping in Bangladesh..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 resize-none"
            />
          </div>

          {/* Founder Contact & Social Media Links */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Founder Direct Connect & Social Links
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  Direct Email
                </span>
                <input
                  type="email"
                  value={founderEmail}
                  onChange={(e) => setFounderEmail(e.target.value)}
                  placeholder="founder@swiftcart.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  LinkedIn URL
                </span>
                <input
                  type="url"
                  value={founderLinkedin}
                  onChange={(e) => setFounderLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  Facebook Profile URL
                </span>
                <input
                  type="url"
                  value={founderFacebook}
                  onChange={(e) => setFounderFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Changes will immediately reflect on the public <code className="text-brand-600 font-bold">/about</code> page.
            </p>

            <button
              type="submit"
              disabled={isSavingFounder}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all active:scale-95 disabled:opacity-60"
            >
              {isSavingFounder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Founder Profile & Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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

              {/* Banner Image Upload & Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Banner Image *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Recommended: 1920x600 or 1200x500 (Max 10MB)
                  </span>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {!imageUrl ? (
                  /* Upload Box / Dropzone as native <label> */
                  <label
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 block select-none ${
                      isUploading
                        ? "border-brand-400 bg-brand-50/50 cursor-wait"
                        : "border-slate-300 hover:border-brand-500 hover:bg-brand-50/20 bg-slate-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                        <span className="text-xs font-bold text-brand-700">
                          Uploading image to server...
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Please wait while your image is being processed
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Click to upload banner image
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Supports JPG, PNG, WEBP, GIF, SVG up to 10MB
                          </p>
                        </div>
                        <span className="mt-1 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs inline-block pointer-events-none">
                          Choose Image File
                        </span>
                      </>
                    )}
                  </label>
                ) : (
                  /* Uploaded Image Preview & Actions */
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-xs space-y-0">
                    <div className="relative h-40 w-full overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Uploaded Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3 flex items-end justify-between">
                        <div className="text-white max-w-xs">
                          {badge && (
                            <span className="text-[9px] font-black uppercase text-brand-400 tracking-wider">
                              {badge}
                            </span>
                          )}
                          <p className="text-xs font-bold truncate">{title || "Slide Title Preview"}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="sr-only"
                              disabled={isUploading}
                            />
                            <UploadCloud className="w-3 h-3" />
                            <span>Replace</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-[11px] font-bold shadow-xs transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono truncate max-w-[280px]">{imageUrl}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Secondary Option: Manual URL input */}
                <div className="pt-1">
                  <details className="text-[11px] text-slate-500 cursor-pointer">
                    <summary className="font-semibold text-slate-600 hover:text-brand-600 select-none">
                      Or specify image by URL instead
                    </summary>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or /uploads/banner.jpg"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-white"
                      />
                    </div>
                  </details>
                </div>
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

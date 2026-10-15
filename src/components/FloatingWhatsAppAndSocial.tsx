"use client";

import React, { useState, useEffect } from "react";
import {
  SOCIAL_PLATFORMS,
  SocialIcon,
  SocialPlatformKey,
  formatSocialUrl,
} from "./SocialIcons";
import { X, MessageCircle, Share2, ChevronUp } from "lucide-react";

export function FloatingWhatsAppAndSocial() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [socialMenuOpen, setSocialMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings(data);
        }
      })
      .catch(() => {});

    // Automatically hide tooltip after 8 seconds if not interacted
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // WhatsApp configuration
  const whatsappRaw =
    settings["social_whatsapp"] || settings["contact_phone"] || "+8801925613994";
  const whatsappUrl = formatSocialUrl("whatsapp", whatsappRaw);

  const socialKeys: SocialPlatformKey[] = [
    "facebook",
    "messenger",
    "instagram",
    "tiktok",
    "youtube",
  ];

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2.5 print:hidden select-none"
      aria-label="Direct customer messaging and social channels"
    >
      {/* Social Accounts Floating Panel / Speed Dial */}
      {socialMenuOpen && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col gap-2">
            <div className="px-2 py-1 text-[10px] font-black tracking-wider uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between gap-4">
              <span>Follow Swift Cart</span>
              <button
                type="button"
                onClick={() => setSocialMenuOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                aria-label="Close social channels list"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {socialKeys.map((key) => {
                const config = SOCIAL_PLATFORMS[key];
                const rawUrl = settings[config.settingKey] || config.defaultUrl;
                const finalUrl = formatSocialUrl(key, rawUrl);

                return (
                  <a
                    key={key}
                    href={finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 transition-all group"
                    aria-label={config.ariaLabel}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl ${config.bgClass} text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
                    >
                      <SocialIcon platform={key} className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left pr-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {config.name}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-none">
                        Open account →
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Strip */}
      <div className="flex items-center gap-2">
        {/* Toggle Social Channels Button */}
        <button
          type="button"
          onClick={() => {
            setSocialMenuOpen(!socialMenuOpen);
            setShowTooltip(false);
          }}
          className={`h-11 px-3.5 rounded-full flex items-center gap-1.5 shadow-lg border transition-all text-xs font-bold ${
            socialMenuOpen
              ? "bg-slate-900 text-white border-slate-800 shadow-slate-900/30"
              : "bg-white text-slate-700 hover:text-slate-900 border-slate-200/90 hover:border-slate-300 shadow-slate-900/10 hover:shadow-slate-900/15"
          }`}
          title="Connect on Facebook, Instagram, TikTok, YouTube & Messenger"
          aria-expanded={socialMenuOpen}
        >
          <Share2 className="w-3.5 h-3.5 text-brand-600" />
          <span className="hidden sm:inline">Social Channels</span>
          <span className="sm:hidden">Social</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
        </button>

        {/* WhatsApp Continuous Floating Button */}
        <div className="relative group flex items-center">
          {/* Tooltip speech bubble */}
          {showTooltip && (
            <div className="absolute right-full mr-3 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-300 pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              <span>Need help? Chat with us!</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-400 hover:text-white ml-1 p-0.5"
                aria-label="Dismiss tooltip"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Tooltip triangle pointer */}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-slate-900"></div>
            </div>
          )}

          {/* Radar ping animation behind WhatsApp button */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none"></span>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-[#25D366]/50 hover:shadow-[#25D366]/70 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Open WhatsApp chat with Swift Cart support"
            title="Chat on WhatsApp (+8801925613994)"
          >
            <SocialIcon platform="whatsapp" className="w-7 h-7 sm:w-8 sm:h-8" />
          </a>
        </div>
      </div>
    </div>
  );
}

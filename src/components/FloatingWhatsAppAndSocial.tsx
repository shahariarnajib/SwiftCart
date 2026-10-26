"use client";

import React, { useState, useEffect } from "react";
import {
  SocialIcon,
  formatSocialUrl,
} from "./SocialIcons";
import { X } from "lucide-react";

export function FloatingWhatsAppAndSocial() {
  const [settings, setSettings] = useState<Record<string, string>>({});
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

  return (
    <div
      className="fixed bottom-24 right-5 sm:bottom-24 sm:right-6 z-50 flex flex-col items-end gap-2.5 print:hidden select-none"
      aria-label="WhatsApp customer support"
    >
      {/* WhatsApp Floating Button */}
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
  );
}

"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { CheckCircle2, X } from "lucide-react";

export function Toast() {
  const { notification, clearNotification } = useCart();

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-800 animate-slide-up max-w-md">
      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
      <p className="text-sm font-medium flex-1 text-slate-100">{notification}</p>
      <button
        onClick={clearNotification}
        className="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors print:hidden"
    >
      <Printer className="w-3.5 h-3.5 text-slate-500" />
      <span>Print Invoice</span>
    </button>
  );
}

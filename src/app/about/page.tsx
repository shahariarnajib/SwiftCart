import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Truck, Users, Award, HeartHandshake, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn about Swift Cart, Bangladesh's modern tech and lifestyle e-commerce platform.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50/50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-brand-600" />
            <span>Our Story</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About Swift Cart
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Swift Cart was founded with one direct mission: to make online shopping in Bangladesh
            faster, simpler, and 100% dependable.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Re-engineering E-Commerce for Bangladesh
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Online shopping in Bangladesh has often been plagued by broken promises, counterfeit goods,
            and agonizingly slow delivery times. Swift Cart was built from scratch to challenge that
            status quo.
          </p>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Operating from our central fulfillment hub in Chawkbazar, Chittagong, Bangladesh, we handpick every product,
            audit manufacturing serial numbers, and inspect packaging before sending it out with trusted
            courier partners across all 64 districts.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-2xl font-black text-brand-600">64</span>
              <p className="text-xs text-slate-500 font-bold mt-1">Districts Covered</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-2xl font-black text-brand-600">100%</span>
              <p className="text-xs text-slate-500 font-bold mt-1">Authentic Guarantee</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-2xl font-black text-brand-600">24-48h</span>
              <p className="text-xs text-slate-500 font-bold mt-1">Express Dispatch Speed</p>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Authenticity First</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We do not accept third-party replicas or grey-market knockoffs. Every SKU is backed by
              warranty and verified serial numbers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Lightning Logistics</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Same-day fulfillment and express dispatch ensure your parcels spend minimal time in transit
              and arrive safely at your doorstep.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Customer Protection</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full Cash on Delivery support and a 7-day replacement guarantee eliminate risk for every
              shopper.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all"
          >
            <span>Explore Our Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

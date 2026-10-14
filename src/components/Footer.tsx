import React from "react";
import Link from "next/link";
import { Zap, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Trust Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/50 border border-brand-700/50 text-brand-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Fast nationwide delivery across BD</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/50 border border-brand-700/50 text-brand-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine</h4>
              <p className="text-xs text-slate-400 mt-0.5">Directly sourced authentic goods</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/50 border border-brand-700/50 text-brand-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">7-day hassle-free replacement</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-900/50 border border-brand-700/50 text-brand-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pay safely after receiving products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <img
                src="/logo-white.png"
                alt="Swift Cart"
                className="h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Swift Cart is Bangladesh&apos;s modern online shopping destination. Delivering premium
              gadgets, electronics, lifestyle products, and everyday essentials directly to your doorstep with speed and trust.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Store
              </span>
              <span>Trade License: TRAD/DNCC/02194</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-brand-400 transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-brand-400 transition-colors">
                  My Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition-colors">
                  About Swift Cart
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  Shipping & Delivery Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-1" />
                <span>Chawkbazar, Chittagong, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <a
                  href="https://wa.me/8801925613994"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  +8801925613994 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <span>support@swiftcart.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} Swift Cart Bangladesh. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span>We Accept: Cash on Delivery • bKash • Nagad • Cards</span>
        </div>
      </div>
    </footer>
  );
}

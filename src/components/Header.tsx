"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";
import { SOCIAL_PLATFORMS, SocialIcon, SocialPlatformKey, formatSocialUrl } from "./SocialIcons";

interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, subtotal, setIsOpen } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryNavItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories and settings for menu
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {});

    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-200 ${
          isScrolled ? "shadow-md border-b border-slate-200/80 py-2.5" : "border-b border-slate-100 py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-700 hover:text-brand-600 focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/logo.png"
                alt="Swift Cart"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
              <Link
                href="/"
                className={`transition-colors hover:text-brand-600 ${
                  pathname === "/" ? "text-brand-600" : ""
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`transition-colors hover:text-brand-600 ${
                  pathname === "/shop" ? "text-brand-600" : ""
                }`}
              >
                Shop All
              </Link>

              {/* Categories Dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  onMouseEnter={() => setCategoriesOpen(true)}
                  className="flex items-center gap-1 transition-colors hover:text-brand-600 py-2"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:rotate-180" />
                </button>

                <div
                  onMouseLeave={() => setCategoriesOpen(false)}
                  className={`absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 transition-all duration-200 ${
                    categoriesOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Browse Categories
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2 px-4">
                    <Link
                      href="/shop"
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-between"
                    >
                      <span>View All Products</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="/about"
                className={`transition-colors hover:text-brand-600 ${
                  pathname === "/about" ? "text-brand-600" : ""
                }`}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className={`transition-colors hover:text-brand-600 ${
                  pathname === "/contact" ? "text-brand-600" : ""
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Search Input Bar (Desktop) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative"
            >
              <input
                type="text"
                placeholder="Search products, brands, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all text-slate-900 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white rounded-full p-1.5 transition-colors"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Actions: Cart & Quick Link */}
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors group"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-50 group-hover:bg-brand-100/80 flex items-center justify-center transition-colors">
                    <ShoppingBag className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
                  </div>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scale-in">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] uppercase font-bold text-slate-400">Cart</span>
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="mt-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white text-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white p-1.5 rounded-lg text-xs"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative flex flex-col w-full max-w-xs bg-white h-full shadow-2xl z-10 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Swift Cart"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="block px-3 py-2.5 rounded-xl font-semibold text-slate-800 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                Shop All Products
              </Link>

              <div className="pt-2 pb-1">
                <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Featured Categories
                </span>
                <div className="mt-1 space-y-0.5">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      className="block px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50/50 rounded-lg"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <Link
                  href="/about"
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
                >
                  Contact Us
                </Link>
                <Link
                  href="/privacy"
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-center gap-2">
                {(["whatsapp", "facebook", "messenger", "instagram", "tiktok", "youtube"] as SocialPlatformKey[]).map((key) => {
                  const config = SOCIAL_PLATFORMS[key];
                  const raw = settings[config.settingKey] || config.defaultUrl;
                  const finalUrl = formatSocialUrl(key, raw);
                  return (
                    <a
                      key={key}
                      href={finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-8 h-8 rounded-lg ${config.bgClass} text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-95`}
                      aria-label={config.ariaLabel}
                      title={config.name}
                    >
                      <SocialIcon platform={key} className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
              <div className="text-center text-xs text-slate-500">
                <a
                  href={formatSocialUrl("whatsapp", settings["social_whatsapp"] || settings["contact_phone"] || "+8801925613994")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
                  <span>WhatsApp: {settings["social_whatsapp"] || settings["contact_phone"] || "+8801925613994"}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

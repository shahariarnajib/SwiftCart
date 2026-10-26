"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { getSafeImageUrl } from "@/lib/format";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string;
  orderIndex?: number;
  isActive?: boolean;
}

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: "default-1",
    title: "Next-Gen Sound & Audio Gear",
    subtitle:
      "Experience unmatched clarity with our authentic active noise cancelling collection. Delivered right to your doorstep.",
    badge: "LIMITED TIME OFFER",
    buttonText: "Explore Audio",
    buttonLink: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "default-2",
    title: "Smart Living. Connected World.",
    subtitle:
      "Premium smartwatches, fitness trackers, and wearables with 1-Year Official Replacement Warranty.",
    badge: "NEW ARRIVALS 2026",
    buttonText: "Shop Wearables",
    buttonLink: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "default-3",
    title: "Fast Nationwide Delivery",
    subtitle:
      "Enjoy Cash on Delivery across all 64 districts in Bangladesh with genuine products and easy returns.",
    badge: "SWIFT EXPRESS",
    buttonText: "Shop All Deals",
    buttonLink: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=85",
  },
];

export function HeroSlider({ banners }: { banners?: BannerSlide[] }) {
  const slides = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance every 5 seconds unless paused
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5">
      {/* Main Slider Carousel Card */}
      <div
        className="relative w-full h-[400px] sm:h-[480px] lg:h-[530px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides rendering */}
        {slides.map((slide, index) => {
          const isActive = index === current;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {/* Background Image */}
              <img
                src={getSafeImageUrl(slide.imageUrl, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=85")}
                alt={slide.title || "Swift Cart Promotional Banner"}
                className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out"
                style={{
                  transform: isActive ? "scale(1.04)" : "scale(1)",
                  transition: "transform 6s ease-out",
                }}
              />

              {/* Sophisticated Dark Gradient Overlay for optimal legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20 sm:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

              {/* Slide Content Box */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-2xl px-6 sm:px-12 lg:px-16 py-8 space-y-4 sm:space-y-5 text-white">
                  {/* Badge */}
                  {slide.badge && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 backdrop-blur-md border border-brand-400/40 text-brand-300 text-xs font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
                      <span>{slide.badge}</span>
                    </div>
                  )}

                  {/* Headline Title */}
                  {slide.title && (
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
                      {slide.title}
                    </h2>
                  )}

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-lg line-clamp-3">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* CTA Button */}
                  {slide.buttonText && slide.buttonLink && (
                    <div className="pt-2 flex items-center gap-4">
                      <Link
                        href={slide.buttonLink}
                        className="px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm shadow-xl shadow-brand-600/40 hover:shadow-brand-600/60 transition-all flex items-center gap-2.5 group/btn active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{slide.buttonText}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <span className="text-xs text-slate-300 hidden sm:inline-block font-medium">
                        • Cash on Delivery Available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows (visible on hover or focus, hidden if single slide) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105"
              aria-label="Previous banner slide"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-105"
              aria-label="Next banner slide"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>
          </>
        )}

        {/* Bottom Carousel Controls: Dots & Slide Index */}
        {total > 1 && (
          <div className="absolute bottom-5 sm:bottom-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
            {/* Pill Indicator Dots */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? "w-8 bg-brand-500 shadow-md shadow-brand-500/50"
                      : "w-2.5 bg-white/40 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Slide Index Counter */}
            <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono font-bold tracking-wider">
              <span>0{current + 1}</span>
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">0{total}</span>
            </div>
          </div>
        )}
      </div>

      {/* Trust Highlights Strip right under slider */}
      <div className="mt-4 sm:mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">Fast Nationwide</h4>
            <p className="text-[11px] text-slate-500">24-48h Dhaka & all 64 districts</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">Cash on Delivery</h4>
            <p className="text-[11px] text-slate-500">Inspect parcel before payment</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">100% Authentic</h4>
            <p className="text-[11px] text-slate-500">Official warranty guaranteed</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">WhatsApp Support</h4>
            <p className="text-[11px] text-slate-500">Instant customer assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

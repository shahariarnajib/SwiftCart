import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Sparkles,
  ShoppingBag,
  Star,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

async function getHomeData() {
  const [categories, featuredProducts, newArrivals, heroBanners] = await Promise.all([
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
    }),
    prisma.product.findMany({
      where: { isFeatured: true, status: "ACTIVE" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.product.findMany({
      where: { isNewArrival: true, status: "ACTIVE" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.banner.findMany({
      where: { section: "HERO", isActive: true },
      orderBy: { orderIndex: "asc" },
    }),
  ]);

  return { categories, featuredProducts, newArrivals, heroBanners };
}

export default async function HomePage() {
  const { categories, featuredProducts, newArrivals, heroBanners } = await getHomeData();

  return (
    <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 pb-16">
      {/* 1. TOP HERO SLIDER BANNER */}
      <HeroSlider banners={heroBanners} />

      {/* 2. FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm font-bold text-slate-700 hover:text-brand-600 inline-flex items-center gap-1 group transition-colors"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/5 transition-all duration-300 flex flex-col text-center p-4"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-white">
                <Image
                  src={cat.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {cat._count.products} {cat._count.products === 1 ? "Product" : "Products"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked For You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            href="/shop?featured=true"
            className="text-sm font-bold text-slate-700 hover:text-brand-600 inline-flex items-center gap-1 group transition-colors"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-xs text-slate-500">
            No featured products listed yet. Add products from your admin panel and toggle &ldquo;Feature on Homepage&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 4. PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl bg-brand-600 text-white overflow-hidden shadow-2xl shadow-brand-600/20">
          {/* Subtle geometric circles background */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-brand-900/30 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 px-6 sm:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white text-brand-700 text-xs font-black uppercase tracking-wider">
                Limited Time Promo
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Great Products. Great Prices.
              </h2>
              <p className="text-brand-50 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Upgrade your tech & lifestyle gear today. Enjoy premium warranties, authentic products,
                and prompt delivery anywhere across Bangladesh.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/shop"
                  className="px-8 py-3.5 rounded-2xl bg-white text-brand-600 hover:bg-slate-50 font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop Promotional Deals</span>
                </Link>
                <span className="text-xs text-brand-100 font-medium">
                  • Pay via Cash on Delivery
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-56 h-56 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 flex flex-col justify-center items-center text-center">
                <Zap className="w-12 h-12 text-white mb-2" />
                <span className="text-3xl font-black">100%</span>
                <span className="text-xs text-brand-100 font-medium mt-1">
                  Genuine & Verified
                </span>
                <div className="mt-3 text-[11px] text-white/80 border-t border-white/20 pt-2">
                  Fast Dispatch from Dhaka
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Fresh Inventory
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/shop?new=true"
            className="text-sm font-bold text-slate-700 hover:text-brand-600 inline-flex items-center gap-1 group transition-colors"
          >
            <span>See All New Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {newArrivals.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-xs text-slate-500">
            No new arrival products listed yet. Add products from your admin panel and toggle &ldquo;New Arrival&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 6. WHY CHOOSE SWIFT CART (TRUST SECTION) */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              The Swift Cart Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Why Customers Love Swift Cart
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We combine speed, authenticity, and attentive customer service so you can shop with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Quality Products</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strict quality checks ensure each item matches advertised specifications.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Competitive Prices</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct sourcing brings genuine gadgets to you at fair, market-best rates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Fast Delivery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Next-day delivery in Dhaka metro and 3-5 days across all 64 districts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Secure Ordering</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero advance risk. Order now and pay cash when your parcel is delivered.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Customer Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dedicated hotline and WhatsApp support ready to assist with orders and queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
            Verified Customer Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Real Feedback from Happy Shoppers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic mb-4">
              &ldquo;Ordered online for delivery in Dhanmondi. Arrived the next afternoon in pristine original packaging with official warranty. Active customer care made it effortless!&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                RA
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Rafiqul Alam</h4>
                <p className="text-[11px] text-slate-400">Dhaka • Verified Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic mb-4">
              &ldquo;Cash on delivery was seamless in Chittagong. I inspected my package before handing over cash to the courier. Highly trustworthy platform.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                SC
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Samira Chowdhury</h4>
                <p className="text-[11px] text-slate-400">Chittagong • Verified Buyer</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic mb-4">
              &ldquo;Items are 100% genuine and high quality. Fast checkout without requiring a complicated sign up. Swift Cart is now my go-to store in Bangladesh.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                MH
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Mahmudul Hasan</h4>
                <p className="text-[11px] text-slate-400">Uttara, Dhaka • Verified Buyer</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

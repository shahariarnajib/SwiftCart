import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
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
  const [categories, featuredProducts, newArrivals] = await Promise.all([
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
  ]);

  return { categories, featuredProducts, newArrivals };
}

export default async function HomePage() {
  const { categories, featuredProducts, newArrivals } = await getHomeData();

  return (
    <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white pt-8 pb-14 lg:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-700 text-xs sm:text-sm font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
                <span>Swift Cart Bangladesh • Fast Nationwide Delivery</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Shop Smarter. <br />
                <span className="text-brand-600 relative inline-block">
                  Shop Faster.
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-brand-300 -z-10"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 10 Q 50 20 100 10"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover premium quality gadgets, electronics, lifestyle gear, and home essentials at
                unbeatable prices. Delivered directly to your doorstep with Cash on Delivery.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-xl shadow-brand-600/30 hover:shadow-brand-600/40 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/shop?sort=price_desc"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border-2 border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Products</span>
                </Link>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/70 max-w-lg mx-auto lg:mx-0">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">৳2,500+</span>
                  <span className="text-xs text-slate-500 font-medium">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center lg:items-start border-x border-slate-200 px-3">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">100%</span>
                  <span className="text-xs text-slate-500 font-medium">Authentic Items</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">24-48h</span>
                  <span className="text-xs text-slate-500 font-medium">Fast Dispatch</span>
                </div>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background decorative blob */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-brand-600/10 to-brand-500/20 rounded-3xl blur-2xl -z-10"></div>

                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white aspect-[4/3] sm:aspect-[1/1]">
                  <Image
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                    alt="Swift Cart Featured Collection"
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="inline-block px-3 py-1 rounded-full bg-brand-600 text-white text-xs font-black uppercase tracking-wider mb-2">
                      Special Offer
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight">
                      Wireless Audio & Smart Gadgets
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1">
                      Up to 30% OFF this season with Cash on Delivery.
                    </p>
                  </div>
                </div>

                {/* Floating Badge 1 */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3 animate-slide-up">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Cash on Delivery</div>
                    <div className="text-[11px] text-slate-500">Pay upon parcel arrival</div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -top-4 -right-4 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-brand-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Swift Express</div>
                    <div className="text-[11px] text-slate-500">Banani Hub, Dhaka</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
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
              &ldquo;Ordered the Swift Sound ANC headphones in Dhanmondi. Arrived the next afternoon in pristine original packaging. Active noise cancellation works like a charm!&rdquo;
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
              &ldquo;Cash on delivery was seamless in Chittagong. I inspected the AuraFit Smart Watch before handing over cash to the courier. Highly trustworthy platform.&rdquo;
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
              &ldquo;The mechanical keyboard feels solid and genuine. Fast checkout without creating a complicated account. Swift Cart is now my go-to tech store in BD.&rdquo;
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

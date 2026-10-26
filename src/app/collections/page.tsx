import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSafeImageUrl } from "@/lib/format";
import { Layers, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Collections & Categories | Swift Cart",
  description: "Browse all curated product collections and categories available at Swift Cart Bangladesh.",
};

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { orderIndex: "asc" },
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Collections</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-bold text-xs uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            All Collections & Categories
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Discover all {categories.length} product collections available at Swift Cart. Pick a category
            below to explore verified items with nationwide Cash on Delivery.
          </p>
        </div>

        {/* Collections Grid */}
        {categories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No collections yet</h3>
            <p className="text-xs text-slate-500 mb-6">
              New product collections are currently being curated. Please check back soon.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse All Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100">
                    <Image
                      src={getSafeImageUrl(cat.image)}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description || "Browse top-quality items in this collection."}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {cat._count.products} {cat._count.products === 1 ? "Product" : "Products"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

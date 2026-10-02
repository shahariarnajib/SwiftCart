import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Search, Filter, SlidersHorizontal, RefreshCcw } from "lucide-react";

export const revalidate = 30;

interface ShopPageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
    stock?: string;
    featured?: string;
    new?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, category, sort = "newest", stock, featured, new: isNew } = searchParams;

  // Build Prisma filter
  const where: Record<string, any> = {
    status: "ACTIVE",
  };

  if (category) {
    where.category = { slug: category };
  }

  if (featured === "true") {
    where.isFeatured = true;
  }

  if (isNew === "true") {
    where.isNewArrival = true;
  }

  if (stock === "in_stock") {
    where.stock = { gt: 0 };
  }

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { sku: { contains: q } },
    ];
  }

  // Sorting
  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { regularPrice: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { regularPrice: "desc" };
  } else if (sort === "name") {
    orderBy = { name: "asc" };
  }

  const [products, categories, totalActiveCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header / Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/" className="hover:text-brand-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Shop Catalog</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {q ? `Search results for "${q}"` : "Explore All Products"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Showing {products.length} of {totalActiveCount} genuine items in Bangladesh
              </p>
            </div>

            {/* Quick Sort Dropdown Form */}
            <form method="GET" className="flex items-center gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              {q && <input type="hidden" name="q" value={q} />}
              {stock && <input type="hidden" name="stock" value={stock} />}
              {featured && <input type="hidden" name="featured" value={featured} />}
              {isNew && <input type="hidden" name="new" value={isNew} />}

              <label htmlFor="sort" className="text-xs font-semibold text-slate-500 shrink-0">
                Sort by:
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-500 shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
              <button
                type="submit"
                className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Apply
              </button>
            </form>
          </div>
        </div>

        {/* Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span>Filters</span>
                </div>
                {(category || q || stock || featured || isNew) && (
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </Link>
                )}
              </div>

              {/* Categories Filter */}
              <div className="space-y-2 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Category
                </span>
                <Link
                  href="/shop"
                  className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                    !category
                      ? "bg-brand-50 text-brand-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>All Categories</span>
                  <span>{totalActiveCount}</span>
                </Link>

                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}${sort ? `&sort=${sort}` : ""}`}
                    className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                      category === c.slug
                        ? "bg-brand-50 text-brand-600 font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-slate-400 text-[11px] shrink-0 ml-1">
                      {c._count.products}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Stock Filter */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Availability
                </span>
                <Link
                  href={`/shop?${category ? `category=${category}&` : ""}${
                    sort ? `sort=${sort}&` : ""
                  }`}
                  className={`block text-xs py-1 px-2 rounded-lg ${
                    !stock ? "text-brand-600 font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Items
                </Link>
                <Link
                  href={`/shop?stock=in_stock${category ? `&category=${category}` : ""}${
                    sort ? `&sort=${sort}` : ""
                  }`}
                  className={`block text-xs py-1 px-2 rounded-lg ${
                    stock === "in_stock"
                      ? "text-brand-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  In Stock Only
                </Link>
              </div>

              {/* Featured & New Arrival Quick Filters */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Curated
                </span>
                <Link
                  href="/shop?featured=true"
                  className={`block text-xs py-1 px-2 rounded-lg ${
                    featured === "true"
                      ? "text-brand-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Featured Collection
                </Link>
                <Link
                  href="/shop?new=true"
                  className={`block text-xs py-1 px-2 rounded-lg ${
                    isNew === "true"
                      ? "text-brand-600 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  New Arrivals
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-xs text-slate-500 mb-6">
                  We couldn&apos;t find any items matching your selected criteria. Try adjusting your
                  search or filter options.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <span>Clear All Filters</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

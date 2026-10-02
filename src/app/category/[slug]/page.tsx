import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Sparkles } from "lucide-react";

export const revalidate = 30;

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { sort?: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} - Swift Cart Bangladesh`,
    description: category.description || `Browse quality ${category.name} at Swift Cart. Cash on Delivery across Bangladesh.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const { sort = "newest" } = searchParams;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { regularPrice: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { regularPrice: "desc" };
  } else if (sort === "name") {
    orderBy = { name: "asc" };
  }

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      status: "ACTIVE",
    },
    orderBy,
    include: {
      category: true,
      images: { orderBy: { orderIndex: "asc" } },
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
          <Link href="/shop" className="hover:text-brand-600 transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{category.name}</span>
        </div>

        {/* Category Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Category Collection
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="mt-4 text-xs font-semibold text-slate-400">
              Showing {products.length} {products.length === 1 ? "Product" : "Products"}
            </div>
          </div>

          {/* Sort Selector */}
          <form method="GET" className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs font-semibold text-slate-500 shrink-0">
              Sort:
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
            <button
              type="submit"
              className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-2">No products in this category</h3>
            <p className="text-xs text-slate-500 mb-6">
              Check back soon as we continuously stock new items in {category.name}.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse All Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Eye, Check } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { QuickViewModal } from "./QuickViewModal";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice: number | null;
  stock: number;
  sku: string;
  description: string;
  specifications?: string | null;
  category?: {
    name: string;
    slug: string;
  };
  images: Array<{
    url: string;
    altText?: string | null;
  }>;
}

export function ProductCard({ product }: { product: ProductItem }) {
  const { addItem } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const price = product.salePrice ?? product.regularPrice;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)
    : 0;

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    setIsAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: price,
      regularPrice: product.regularPrice,
      image: primaryImage,
      sku: product.sku,
      stock: product.stock,
    });

    setTimeout(() => {
      setIsAdding(false);
    }, 700);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 flex flex-col overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && (
            <span className="bg-brand-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Only {product.stock} Left
            </span>
          ) : null}
        </div>

        {/* Quick View Button on Hover */}
        <button
          type="button"
          onClick={() => setIsQuickViewOpen(true)}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-brand-600 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Product Image Link */}
        <Link
          href={`/product/${product.slug}`}
          className="relative block w-full aspect-square bg-slate-50 overflow-hidden"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className={`object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
              isOutOfStock ? "grayscale opacity-60" : ""
            }`}
          />
        </Link>

        {/* Card Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Category */}
          {product.category && (
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              {product.category.name}
            </span>
          )}

          {/* Product Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </Link>

          {/* Price & Stock info */}
          <div className="mt-auto pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                {formatCurrency(price)}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  {formatCurrency(product.regularPrice)}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : isAdding
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 hover:shadow-brand-600/30 active:scale-95"
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : isAdding ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
}

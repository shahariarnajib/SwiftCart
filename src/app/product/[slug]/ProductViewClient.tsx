"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  AlertCircle,
  Share2,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/CartContext";

interface ProductViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    regularPrice: number;
    salePrice: number | null;
    stock: number;
    description: string;
    specifications: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    images: Array<{
      id: string;
      url: string;
      altText?: string | null;
    }>;
  };
}

export function ProductViewClient({ product }: ProductViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const price = product.salePrice ?? product.regularPrice;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const images =
    product.images.length > 0
      ? product.images.map((img) => img.url)
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"];

  let parsedSpecs: Record<string, string> = {};
  if (product.specifications) {
    try {
      parsedSpecs = JSON.parse(product.specifications);
    } catch {
      // If plain text
      parsedSpecs = { Details: product.specifications };
    }
  }

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        regularPrice: product.regularPrice,
        image: images[0],
        sku: product.sku,
        stock: product.stock,
      },
      quantity
    );
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const ok = addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price,
        regularPrice: product.regularPrice,
        image: images[0],
        sku: product.sku,
        stock: product.stock,
      },
      quantity
    );
    if (ok) {
      router.push("/checkout");
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* 1. Left Gallery Column */}
      <div className="lg:col-span-6 space-y-4">
        {/* Main Display Image */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm">
          <Image
            src={images[selectedImage]}
            alt={product.name}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-slate-900 text-white font-extrabold text-sm uppercase tracking-widest px-4 py-2 rounded-full border border-slate-700 shadow-xl">
                Currently Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImage === idx
                    ? "border-brand-600 shadow-md scale-105"
                    : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right Product Info Column */}
      <div className="lg:col-span-6 flex flex-col">
        {/* Category & SKU */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <Link
            href={`/category/${product.category.slug}`}
            className="text-xs font-bold text-brand-600 uppercase tracking-wider hover:underline"
          >
            {product.category.name}
          </Link>
          <span className="text-xs font-semibold text-slate-400">SKU: {product.sku}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug mb-4">
          {product.name}
        </h1>

        {/* Price Area */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {formatCurrency(price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-slate-400 line-through font-medium">
                  {formatCurrency(product.regularPrice)}
                </span>
                <span className="bg-brand-100 text-brand-700 text-xs font-extrabold px-2.5 py-1 rounded-full">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stock Badge */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} items remaining
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} available)
              </span>
            )}
          </div>
        </div>

        {/* Quantity and Purchasing */}
        <div className="space-y-4 mb-8">
          {!isOutOfStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold transition-colors text-base"
                >
                  -
                </button>
                <span className="px-5 py-2 font-bold text-slate-900 min-w-[40px] text-center text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-700 font-bold transition-colors text-base"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-400">Total: {formatCurrency(price * quantity)}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : isAdding
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30 active:scale-95"
              }`}
            >
              {isOutOfStock ? (
                <span>Out of Stock</span>
              ) : isAdding ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all duration-200 ${
                isOutOfStock
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:scale-95"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now (Instant Checkout)</span>
            </button>
          </div>
        </div>

        {/* Benefits Box */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 mb-8">
          <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
            <Truck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              <strong>Nationwide Delivery:</strong> 24-48 hrs inside Dhaka (৳60), 3-5 days outside
              (৳120).
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-700 font-medium border-t border-slate-100 pt-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Cash on Delivery:</strong> Inspect your parcel at delivery before payment.
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-700 font-medium border-t border-slate-100 pt-2.5">
            <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>7 Days Return Policy:</strong> Replacement guarantee for manufacturing defects.
            </span>
          </div>
        </div>

        {/* Share Button */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? "Product Link Copied!" : "Share this product"}</span>
          </button>
          <span className="text-[11px] text-slate-400">Guaranteed 100% Genuine</span>
        </div>
      </div>
    </div>
  );
}

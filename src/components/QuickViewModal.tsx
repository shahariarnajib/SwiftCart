"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight, Check } from "lucide-react";
import { ProductItem } from "./ProductCard";
import { formatCurrency, getSafeImageUrl } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export function QuickViewModal({
  product,
  isOpen,
  onClose,
}: {
  product: ProductItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const price = product.salePrice ?? product.regularPrice;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.salePrice!) / product.regularPrice) * 100)
    : 0;
  const isOutOfStock = product.stock <= 0;

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => getSafeImageUrl(img.url))
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: price,
        regularPrice: product.regularPrice,
        image: images[0],
        sku: product.sku,
        stock: product.stock,
      },
      quantity
    );
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const ok = addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: price,
        regularPrice: product.regularPrice,
        image: images[0],
        sku: product.sku,
        stock: product.stock,
      },
      quantity
    );
    if (ok) {
      onClose();
      router.push("/checkout");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden z-10 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Images Column */}
          <div className="p-6 bg-slate-50 flex flex-col justify-center items-center">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 max-w-full">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === idx ? "border-brand-600 scale-105" : "border-transparent opacity-70"
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {product.category && (
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 mb-2 leading-snug">
                {product.name}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-black text-slate-900">{formatCurrency(price)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrency(product.regularPrice)}
                    </span>
                    <span className="bg-brand-50 text-brand-600 border border-brand-200 text-xs font-extrabold px-2 py-0.5 rounded-full">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> In Stock ({product.stock} available)
                  </span>
                )}
              </div>

              {/* Description Snippet */}
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div>
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-semibold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-semibold text-slate-900 min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-1.5 hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                    isOutOfStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : added
                      ? "bg-emerald-600 text-white"
                      : "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20"
                  }`}
                >
                  {added ? (
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
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
                    isOutOfStock
                      ? "border-slate-200 text-slate-300 cursor-not-allowed"
                      : "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  Buy Now
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 group"
                >
                  <span>View Complete Details & Specs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

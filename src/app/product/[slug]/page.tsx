import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductViewClient } from "./ProductViewClient";
import { ProductCard } from "@/components/ProductCard";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";

export const revalidate = 30;

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true },
  });

  if (!product) return { title: "Product Not Found" };

  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.name} - Buy Online in Bangladesh`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products in same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 4,
    include: {
      category: true,
      images: { orderBy: { orderIndex: "asc" } },
    },
  });

  let parsedSpecs: Record<string, string> = {};
  if (product.specifications) {
    try {
      parsedSpecs = JSON.parse(product.specifications);
    } catch {
      parsedSpecs = { Details: product.specifications };
    }
  }

  // JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "Swift Cart",
    },
    offers: {
      "@type": "Offer",
      url: `https://swiftcart.com/product/${product.slug}`,
      priceCurrency: "BDT",
      price: product.salePrice ?? product.regularPrice,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="bg-slate-50/50 min-h-screen py-8 sm:py-12">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-600 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-brand-600 transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-12">
          <ProductViewClient product={product} />
        </div>

        {/* Product Details & Specifications Tabs */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-12">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-600" />
              <span>Product Specifications & Overview</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Description Paragraphs */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                About this item
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Genuine and authentic from official distributors</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sealed original package with all verified box accessories</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Tested & verified by Swift Cart quality assurance team</span>
                </div>
              </div>
            </div>

            {/* Specifications Table */}
            <div className="lg:col-span-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Technical Specifications
              </h3>
              {Object.keys(parsedSpecs).length > 0 ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                  {Object.entries(parsedSpecs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 p-3 bg-white even:bg-slate-50/50">
                      <span className="font-semibold text-slate-600">{key}</span>
                      <span className="text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 p-4 border border-dashed rounded-xl">
                  No additional technical specifications listed for this product.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Related Products You May Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

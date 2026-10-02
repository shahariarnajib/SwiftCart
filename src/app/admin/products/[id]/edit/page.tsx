import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/app/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const formData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId,
    regularPrice: product.regularPrice,
    salePrice: product.salePrice ?? "",
    stock: product.stock,
    description: product.description,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    status: product.status,
    specifications: product.specifications || "",
    images: product.images.map((img) => img.url),
  };

  return <ProductForm categories={categories} initialData={formData} isEdit={true} />;
}

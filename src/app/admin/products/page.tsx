import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return <ProductsClient initialProducts={products} categories={categories} />;
}

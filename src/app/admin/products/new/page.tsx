import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/app/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    select: { id: true, name: true },
  });

  return <ProductForm categories={categories} isEdit={false} />;
}

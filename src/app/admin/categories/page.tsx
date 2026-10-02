import React from "react";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  return <CategoriesClient initialCategories={categories} />;
}

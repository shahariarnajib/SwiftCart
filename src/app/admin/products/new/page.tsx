import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { ProductForm } from "@/app/admin/products/ProductForm";

export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  let categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    select: { id: true, name: true },
  });

  return <ProductForm categories={categories} isEdit={false} />;
}

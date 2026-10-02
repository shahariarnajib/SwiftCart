import React from "react";
import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { stock: "asc" }, // Show lowest stock products at the top!
    include: {
      category: { select: { name: true } },
      images: { orderBy: { orderIndex: "asc" } },
    },
  });

  return <InventoryClient initialProducts={products} />;
}

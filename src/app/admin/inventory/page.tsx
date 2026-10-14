import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InventoryClient } from "./InventoryClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stock: "asc" },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const formattedMovements = movements.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <InventoryClient
      initialProducts={products}
      initialMovements={formattedMovements}
    />
  );
}

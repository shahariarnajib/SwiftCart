import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [orders, orderItems, categories] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        deliveryCharge: true,
        discount: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.findMany({
      select: {
        productId: true,
        productName: true,
        productSku: true,
        price: true,
        quantity: true,
      },
    }),
    prisma.category.findMany({
      include: {
        products: {
          select: { id: true, regularPrice: true, stock: true },
        },
      },
    }),
  ]);

  // Financial aggregates
  let grossSubtotal = 0;
  let totalDelivery = 0;
  let totalDiscounts = 0;
  let netRevenue = 0;
  let cancelledVolume = 0;

  for (const ord of orders) {
    if (ord.status === "CANCELLED") {
      cancelledVolume += ord.total;
    } else {
      grossSubtotal += ord.subtotal;
      totalDelivery += ord.deliveryCharge;
      totalDiscounts += ord.discount;
      netRevenue += ord.total;
    }
  }

  // Top products calculation
  const productSalesMap = new Map<string, { name: string; sku: string; units: number; revenue: number }>();
  for (const it of orderItems) {
    const key = it.productId || it.productSku || it.productName;
    const existing = productSalesMap.get(key) || {
      name: it.productName,
      sku: it.productSku,
      units: 0,
      revenue: 0,
    };
    existing.units += it.quantity;
    existing.revenue += it.price * it.quantity;
    productSalesMap.set(key, existing);
  }

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const reportData = {
    summary: {
      totalOrders: orders.length,
      grossSubtotal,
      totalDelivery,
      totalDiscounts,
      netRevenue,
      cancelledVolume,
    },
    topProducts,
    recentOrders: orders.slice(0, 10).map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
  };

  return <ReportsClient initialData={reportData} />;
}

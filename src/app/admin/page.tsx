import React from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  // Calculate start of today and start of month in Asia/Dhaka
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Parallel fetching of all dashboard statistics
  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalCustomers,
    allOrders,
    recentOrders,
    lowStockItems,
    categories,
    recentLogs,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 }, status: "ACTIVE" } }),
    prisma.product.count({ where: { stock: 0, status: "ACTIVE" } }),
    prisma.customer.count(),
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        city: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, status: "ACTIVE" },
      take: 5,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        salePrice: true,
        regularPrice: true,
      },
    }),
    prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { products: true } },
      },
      take: 6,
    }),
    prisma.adminActivityLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        adminName: true,
        action: true,
        entity: true,
        details: true,
        createdAt: true,
      },
    }),
  ]);

  // Net revenue calculations (excluding cancellations)
  let totalRevenue = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;

  for (const ord of allOrders) {
    totalRevenue += ord.total;
    const ordDate = new Date(ord.createdAt);
    if (ordDate >= startOfToday) {
      todayRevenue += ord.total;
    }
    if (ordDate >= startOfMonth) {
      monthRevenue += ord.total;
    }
  }

  const dashboardData = {
    metrics: {
      totalRevenue,
      todayRevenue,
      monthRevenue,
      totalOrders,
      todayOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCustomers,
    },
    recentOrders: recentOrders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
    lowStockItems,
    categoryBreakdown: categories.map((c) => ({
      name: c.name,
      count: c._count.products,
    })),
    recentLogs: recentLogs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
    adminName: admin.name || admin.username,
  };

  return <DashboardClient data={dashboardData} />;
}

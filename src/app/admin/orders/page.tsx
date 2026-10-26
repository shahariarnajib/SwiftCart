import React from "react";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const { status, q } = searchParams;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      customer: true,
    },
  });

  const formattedOrders = orders.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    customer: o.customer
      ? {
          ...o.customer,
          createdAt: o.customer.createdAt.toISOString(),
          updatedAt: o.customer.updatedAt.toISOString(),
        }
      : null,
  }));

  return (
    <OrdersClient
      initialOrders={formattedOrders}
      defaultStatus={status}
      defaultQuery={q}
    />
  );
}

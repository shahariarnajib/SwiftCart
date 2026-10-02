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

  return (
    <OrdersClient
      initialOrders={orders}
      defaultStatus={status}
      defaultQuery={q}
    />
  );
}

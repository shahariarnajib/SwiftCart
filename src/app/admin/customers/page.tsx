import React from "react";
import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./CustomersClient";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  const formattedCustomers = customers.map((c) => {
    const totalSpent = c.orders.reduce((sum, ord) => {
      if (ord.status !== "CANCELLED") {
        return sum + ord.total;
      }
      return sum;
    }, 0);

    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      city: c.city,
      area: c.area,
      ordersCount: c.orders.length,
      totalSpent,
      createdAt: c.createdAt,
      recentOrders: c.orders.slice(0, 3),
    };
  });

  return <CustomersClient initialCustomers={formattedCustomers} />;
}

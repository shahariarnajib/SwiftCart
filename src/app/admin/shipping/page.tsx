import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShippingClient } from "./ShippingClient";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const settings = await prisma.storeSetting.findMany({
    where: {
      key: {
        in: [
          "delivery_inside_dhaka",
          "delivery_outside_dhaka",
          "free_shipping_threshold",
          "courier_provider_default",
        ],
      },
    },
  });

  const settingsMap: Record<string, string> = {
    delivery_inside_dhaka: "60",
    delivery_outside_dhaka: "120",
    free_shipping_threshold: "2500",
    courier_provider_default: "Steadfast Courier",
  };

  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return <ShippingClient initialSettings={settingsMap} />;
}

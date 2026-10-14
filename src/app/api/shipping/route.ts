import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const zones = await prisma.shippingZone.findMany({
      orderBy: { createdAt: "asc" },
    });

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

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ zones, settings: settingsMap });
  } catch (error) {
    console.error("Failed to fetch shipping settings:", error);
    return NextResponse.json({ error: "Failed to fetch shipping settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      delivery_inside_dhaka,
      delivery_outside_dhaka,
      free_shipping_threshold,
      courier_provider_default,
    } = body;

    const updates = [
      { key: "delivery_inside_dhaka", value: String(delivery_inside_dhaka ?? 60) },
      { key: "delivery_outside_dhaka", value: String(delivery_outside_dhaka ?? 120) },
      { key: "free_shipping_threshold", value: String(free_shipping_threshold ?? 2500) },
      { key: "courier_provider_default", value: courier_provider_default || "Steadfast Courier" },
    ];

    for (const item of updates) {
      await prisma.storeSetting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value },
        update: { value: item.value },
      });
    }

    await logAdminActivity(admin, "UPDATE_SHIPPING_SETTINGS", "SETTINGS", "shipping", updates);

    return NextResponse.json({ success: true, message: "Shipping rates saved successfully." });
  } catch (error) {
    console.error("Failed to update shipping settings:", error);
    return NextResponse.json({ error: "Failed to update shipping settings" }, { status: 500 });
  }
}

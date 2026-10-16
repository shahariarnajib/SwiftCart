import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return handleUpdateSettings(req);
}

export async function POST(req: Request) {
  return handleUpdateSettings(req);
}

async function handleUpdateSettings(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json(); // key-value pairs

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string" || typeof value === "number") {
        await prisma.storeSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    await logAdminActivity(admin, "UPDATE_STORE_SETTINGS", "SETTINGS", "store", body);

    // Revalidate frontend pages that use store settings
    try {
      revalidatePath("/about");
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/contact");
    } catch {}

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

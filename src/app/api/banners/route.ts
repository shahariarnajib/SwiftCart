import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");
    const activeOnly = searchParams.get("active") === "true";

    const where: Record<string, any> = {};
    if (section) where.section = section;
    if (activeOnly) where.isActive = true;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
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
      title,
      subtitle,
      badge,
      buttonText,
      buttonLink,
      imageUrl,
      section,
      orderIndex,
      isActive,
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Banner image is required." },
        { status: 400 }
      );
    }

    const bannerTitle = (title && title.trim()) ? title.trim() : "Banner Slide";

    const banner = await prisma.banner.create({
      data: {
        title: bannerTitle,
        subtitle: subtitle || null,
        badge: badge || null,
        buttonText: buttonText || "Shop Now",
        buttonLink: buttonLink || "/shop",
        imageUrl,
        section: section || "HERO",
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await logAdminActivity(admin, "CREATE_BANNER", "BANNER", banner.id, { title });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Failed to create banner:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}

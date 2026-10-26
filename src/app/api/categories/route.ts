import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, image, icon, orderIndex, isVisible } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let slug = body.slug ? slugify(body.slug) : slugify(name);
    // Ensure slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        icon: icon || null,
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    await logAdminActivity(admin, "CREATE_CATEGORY", "CATEGORY", category.id, { name: category.name });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

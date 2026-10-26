import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true } },
        products: {
          include: { images: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, image, icon, orderIndex, isVisible } = body;

    const dataToUpdate: Record<string, any> = {};
    if (name) dataToUpdate.name = name.trim();
    if (slug) {
      const cleanSlug = slugify(slug);
      // Check if another category already has this slug
      const existingSlug = await prisma.category.findFirst({
        where: { slug: cleanSlug, NOT: { id: params.id } },
      });
      if (existingSlug) {
        dataToUpdate.slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
      } else {
        dataToUpdate.slug = cleanSlug;
      }
    }
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : null;
    if (image !== undefined) dataToUpdate.image = image ? image.trim() : null;
    if (icon !== undefined) dataToUpdate.icon = icon ? icon.trim() : null;
    if (orderIndex !== undefined) dataToUpdate.orderIndex = parseInt(orderIndex, 10);
    if (isVisible !== undefined) dataToUpdate.isVisible = Boolean(isVisible);

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        _count: { select: { products: true } },
      },
    });

    await logAdminActivity(admin, "UPDATE_CATEGORY", "CATEGORY", updated.id, { name: updated.name });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    revalidatePath(`/category/${updated.slug}`);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ error: error?.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: params.id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${productCount} assigned products. Reassign or delete products first.` },
        { status: 400 }
      );
    }

    const deleted = await prisma.category.delete({
      where: { id: params.id },
    });

    await logAdminActivity(admin, "DELETE_CATEGORY", "CATEGORY", params.id, { name: deleted.name });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/categories");

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete category" }, { status: 500 });
  }
}

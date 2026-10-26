import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    const updated = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : undefined,
        subtitle: subtitle !== undefined ? subtitle : undefined,
        badge: badge !== undefined ? badge : undefined,
        buttonText: buttonText !== undefined ? buttonText : undefined,
        buttonLink: buttonLink !== undefined ? buttonLink : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        section: section !== undefined ? section : undefined,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAdminActivity(admin, "UPDATE_BANNER", "BANNER", params.id, { title: updated.title });

    revalidatePath("/");
    revalidatePath("/admin/content");

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update banner:", error);
    return NextResponse.json({ error: error?.message || "Failed to update banner" }, { status: 500 });
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

    const banner = await prisma.banner.delete({
      where: { id: params.id },
    });

    await logAdminActivity(admin, "DELETE_BANNER", "BANNER", params.id, { title: banner.title });

    revalidatePath("/");
    revalidatePath("/admin/content");

    return NextResponse.json({ success: true, message: "Banner deleted successfully." });
  } catch (error: any) {
    console.error("Failed to delete banner:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete banner" }, { status: 500 });
  }
}

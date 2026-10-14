import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized access: Super Admin only." }, { status: 403 });
    }

    const body = await req.json();
    const { name, role, status, password } = body;

    const targetUser = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prevent demoting the last active super admin
    if (targetUser.role === "SUPER_ADMIN" && role && role !== "SUPER_ADMIN") {
      const superAdminCount = await prisma.adminUser.count({
        where: { role: "SUPER_ADMIN", status: "ACTIVE" },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot change role: You must maintain at least one active Super Admin." },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password && password.trim()) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.adminUser.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await logAdminActivity(
      currentAdmin,
      "UPDATE_ADMIN_USER",
      "ADMIN_USER",
      params.id,
      { username: targetUser.username, changes: updateData }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update admin user:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin only." }, { status: 403 });
    }

    if (currentAdmin.id === params.id) {
      return NextResponse.json({ error: "You cannot delete your own active administrator account." }, { status: 400 });
    }

    const target = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!target) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    await prisma.adminUser.delete({
      where: { id: params.id },
    });

    await logAdminActivity(
      currentAdmin,
      "DELETE_ADMIN_USER",
      "ADMIN_USER",
      params.id,
      { username: target.username }
    );

    return NextResponse.json({ success: true, message: "Administrator deleted successfully." });
  } catch (error) {
    console.error("Failed to delete admin user:", error);
    return NextResponse.json({ error: "Failed to delete administrator" }, { status: 500 });
  }
}

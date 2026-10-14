import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized access: Super Admin only." }, { status: 403 });
    }

    const team = await prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("Failed to fetch team:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentAdmin = await getCurrentAdmin();
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Only Super Admins can add administrators." }, { status: 403 });
    }

    const body = await req.json();
    const { name, username, email, password, role } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "Name, username, email, and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check unique username & email
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An administrator with this username or email already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        role: role || "ORDER_MANAGER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await logAdminActivity(
      currentAdmin,
      "CREATE_ADMIN_USER",
      "ADMIN_USER",
      newAdmin.id,
      { username: newAdmin.username, role: newAdmin.role }
    );

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error("Failed to create admin:", error);
    return NextResponse.json({ error: "Failed to create administrator" }, { status: 500 });
  }
}

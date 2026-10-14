import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 });
    }

    const customerNote = await prisma.customerNote.create({
      data: {
        customerId: params.id,
        note: note.trim(),
        authorName: admin.name || admin.username,
      },
    });

    await logAdminActivity(admin, "ADD_CUSTOMER_NOTE", "CUSTOMER", params.id, { note });

    return NextResponse.json(customerNote, { status: 201 });
  } catch (error) {
    console.error("Failed to add customer note:", error);
    return NextResponse.json({ error: "Failed to add note" }, { status: 500 });
  }
}

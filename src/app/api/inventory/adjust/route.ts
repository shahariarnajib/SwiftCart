import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, changeQuantity, newStock, reason } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Adjustment reason is mandatory." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    let finalStock: number;
    let qtyChange: number;

    if (newStock !== undefined) {
      finalStock = Math.max(0, parseInt(newStock, 10));
      qtyChange = finalStock - product.stock;
    } else if (changeQuantity !== undefined) {
      qtyChange = parseInt(changeQuantity, 10);
      finalStock = Math.max(0, product.stock + qtyChange);
    } else {
      return NextResponse.json(
        { error: "Either changeQuantity or newStock must be provided." },
        { status: 400 }
      );
    }

    // Determine changeType
    let changeType = "MANUAL_ADJUSTMENT";
    if (reason.toLowerCase().includes("restock")) {
      changeType = "RESTOCK";
    } else if (reason.toLowerCase().includes("damaged")) {
      changeType = "DAMAGED_WRITE_OFF";
    } else if (reason.toLowerCase().includes("return")) {
      changeType = "RETURN";
    }

    // Execute stock update and log inventory movement atomically
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: finalStock },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          changeType,
          quantity: qtyChange,
          previousStock: product.stock,
          newStock: finalStock,
          reason: reason.trim(),
          adminName: admin.name || admin.username,
        },
      });

      return { product: updatedProduct, movement };
    });

    // Record admin activity
    await logAdminActivity(
      admin,
      "INVENTORY_ADJUSTMENT",
      "PRODUCT",
      product.id,
      {
        productName: product.name,
        sku: product.sku,
        previousStock: product.stock,
        newStock: finalStock,
        change: qtyChange,
        reason,
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Inventory adjustment failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to adjust inventory." },
      { status: 500 }
    );
  }
}

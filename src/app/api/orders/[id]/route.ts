import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        items: true,
        customer: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
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
      status,
      paymentStatus,
      deliveryProvider,
      trackingNumber,
      internalNotes,
      statusNote,
    } = body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "REFUNDED",
    ];

    const currentOrder = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: { items: true },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (deliveryProvider !== undefined) updateData.deliveryProvider = deliveryProvider;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (paymentStatus) {
      const validPaymentStatuses = ["PENDING", "PAID", "REFUNDED", "FAILED"];
      if (validPaymentStatuses.includes(paymentStatus)) {
        updateData.paymentStatus = paymentStatus;
      }
    }

    // Handle status transitions
    if (status && status !== currentOrder.status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          { status: 400 }
        );
      }

      // Explicit transition validation
      if (currentOrder.status === "DELIVERED" && status === "CANCELLED") {
        return NextResponse.json(
          { error: "Delivered orders cannot be cancelled directly. Use RETURNED or REFUNDED instead." },
          { status: 400 }
        );
      }

      updateData.status = status;

      // Handle stock restoration on cancellation (Idempotent!)
      if (status === "CANCELLED" && !currentOrder.isStockRestored) {
        await prisma.$transaction(async (tx) => {
          for (const item of currentOrder.items) {
            if (!item.productId) continue;
            const prod = await tx.product.findUnique({ where: { id: item.productId } });
            if (prod) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: prod.stock + item.quantity },
              });

              // Log inventory movement
              await tx.inventoryMovement.create({
                data: {
                  productId: item.productId,
                  productName: item.productName,
                  sku: item.productSku,
                  changeType: "CANCELLATION_RESTORE",
                  quantity: item.quantity,
                  previousStock: prod.stock,
                  newStock: prod.stock + item.quantity,
                  reason: `Order ${currentOrder.orderNumber} cancelled`,
                  adminName: admin.name || admin.username,
                },
              });
            }
          }

          updateData.isStockRestored = true;

          // Record order status history
          await tx.orderStatusHistory.create({
            data: {
              orderId: currentOrder.id,
              fromStatus: currentOrder.status,
              toStatus: status,
              note: statusNote || `Status changed from ${currentOrder.status} to ${status}. Inventory restored.`,
              changedBy: admin.name || admin.username,
            },
          });

          await tx.order.update({
            where: { id: currentOrder.id },
            data: updateData,
          });
        });
      } else {
        // Normal status change without stock restoration
        await prisma.$transaction(async (tx) => {
          await tx.orderStatusHistory.create({
            data: {
              orderId: currentOrder.id,
              fromStatus: currentOrder.status,
              toStatus: status,
              note: statusNote || `Status updated to ${status}`,
              changedBy: admin.name || admin.username,
            },
          });

          await tx.order.update({
            where: { id: currentOrder.id },
            data: updateData,
          });
        });
      }
    } else if (Object.keys(updateData).length > 0) {
      await prisma.order.update({
        where: { id: currentOrder.id },
        data: updateData,
      });
    }

    // Log admin activity
    await logAdminActivity(
      admin,
      "UPDATE_ORDER",
      "ORDER",
      currentOrder.id,
      { orderNumber: currentOrder.orderNumber, changes: { status, paymentStatus, deliveryProvider, trackingNumber } }
    );

    const updated = await prisma.order.findUnique({
      where: { id: currentOrder.id },
      include: {
        items: true,
        customer: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        payments: true,
      },
    });

    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
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

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Delete child status history
      await tx.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
      // Delete child payments
      await tx.payment.deleteMany({ where: { orderId: order.id } });
      // Delete child coupon redemptions
      await tx.couponRedemption.deleteMany({ where: { orderId: order.id } });
      // Delete child order items
      await tx.orderItem.deleteMany({ where: { orderId: order.id } });
      // Delete the order
      await tx.order.delete({ where: { id: order.id } });
    });

    await logAdminActivity(
      admin,
      "DELETE_ORDER",
      "ORDER",
      order.id,
      { orderNumber: order.orderNumber, total: order.total }
    );

    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json({ success: true, message: `Order ${order.orderNumber} deleted successfully.` });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}

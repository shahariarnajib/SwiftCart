import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;

    const where: Record<string, any> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        items: true,
        customer: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      area,
      postalCode,
      orderNotes,
      deliveryZone,
      items,
    } = body;

    // Validate required fields
    if (!customerName || !phone || !address || !city) {
      return NextResponse.json(
        { error: "Name, phone number, address, and city are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one product." }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phone.trim();

    // Run order placement inside transaction to lock and decrement stock safely
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current live products and check stock
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { images: true },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      let subtotal = 0;
      const orderItemsToCreate: Array<{
        productId: string;
        productName: string;
        productSku: string;
        price: number;
        quantity: number;
        image: string;
      }> = [];

      for (const item of items) {
        const prod = productMap.get(item.productId);
        if (!prod) {
          throw new Error(`Product not found (ID: ${item.productId})`);
        }

        if (prod.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`
          );
        }

        // Active price snapshot at purchase time
        const unitPrice = prod.salePrice ?? prod.regularPrice;
        subtotal += unitPrice * item.quantity;

        const primaryImg =
          prod.images.length > 0
            ? prod.images[0].url
            : item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

        orderItemsToCreate.push({
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          price: unitPrice,
          quantity: item.quantity,
          image: primaryImg,
        });

        // Decrement stock
        await tx.product.update({
          where: { id: prod.id },
          data: {
            stock: prod.stock - item.quantity,
          },
        });
      }

      // Calculate Delivery Fee (Free if subtotal > 2500, otherwise Dhaka 60, Outside 120)
      const deliveryCharge =
        subtotal > 2500 ? 0 : deliveryZone === "outside_dhaka" ? 120 : 60;
      const total = subtotal + deliveryCharge;

      // 2. Generate unique order number (e.g. SC-1002)
      const lastOrder = await tx.order.findFirst({
        orderBy: { createdAt: "desc" },
        select: { orderNumber: true },
      });

      let nextNumber = 1001;
      if (lastOrder && lastOrder.orderNumber.startsWith("SC-")) {
        const parsed = parseInt(lastOrder.orderNumber.replace("SC-", ""), 10);
        if (!isNaN(parsed)) {
          nextNumber = parsed + 1;
        }
      }
      const orderNumber = `SC-${nextNumber}`;

      // 3. Upsert Customer Record
      let customer = await tx.customer.findUnique({
        where: { phone: cleanPhone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName.trim(),
            phone: cleanPhone,
            email: email ? email.trim() : null,
            address: address.trim(),
            city: city.trim(),
            area: area ? area.trim() : null,
            postalCode: postalCode ? postalCode.trim() : null,
          },
        });
      } else {
        // Update customer details with latest address
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName.trim(),
            email: email ? email.trim() : customer.email,
            address: address.trim(),
            city: city.trim(),
            area: area ? area.trim() : customer.area,
            postalCode: postalCode ? postalCode.trim() : customer.postalCode,
          },
        });
      }

      // 4. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName.trim(),
          phone: cleanPhone,
          email: email ? email.trim() : null,
          address: address.trim(),
          city: city.trim(),
          area: area ? area.trim() : null,
          postalCode: postalCode ? postalCode.trim() : null,
          orderNotes: orderNotes ? orderNotes.trim() : null,
          subtotal,
          deliveryCharge,
          discount: 0,
          total,
          paymentMethod: "Cash on Delivery",
          status: "PENDING",
          customerId: customer.id,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Order placement failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to place order. Please try again." },
      { status: 400 }
    );
  }
}

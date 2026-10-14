import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "orders"; // orders, products, inventory, customers

    let csvContent = "";
    let filename = `swift-cart-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (type === "orders") {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      const headers = [
        "Order Number",
        "Date",
        "Customer Name",
        "Phone",
        "City",
        "Address",
        "Subtotal (BDT)",
        "Delivery Fee (BDT)",
        "Discount (BDT)",
        "Total (BDT)",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Item Count",
      ];

      const rows = orders.map((o) => [
        `"${o.orderNumber}"`,
        `"${o.createdAt.toISOString()}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.phone}"`,
        `"${o.city}"`,
        `"${o.address.replace(/"/g, '""')}"`,
        o.subtotal,
        o.deliveryCharge,
        o.discount,
        o.total,
        `"${o.paymentMethod}"`,
        `"${o.paymentStatus}"`,
        `"${o.status}"`,
        o.items.length,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "products") {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: { category: true },
      });

      const headers = [
        "Product Name",
        "SKU",
        "Category",
        "Regular Price (BDT)",
        "Sale Price (BDT)",
        "Cost Price (BDT)",
        "Stock",
        "Status",
        "Featured",
        "Date Created",
      ];

      const rows = products.map((p) => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${p.category.name}"`,
        p.regularPrice,
        p.salePrice ?? "",
        p.costPrice ?? "",
        p.stock,
        `"${p.status}"`,
        p.isFeatured ? "Yes" : "No",
        `"${p.createdAt.toISOString()}"`,
      ]);

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "inventory") {
      const products = await prisma.product.findMany({
        orderBy: { stock: "asc" },
        include: { category: true },
      });

      const headers = [
        "Product Name",
        "SKU",
        "Category",
        "Current Stock",
        "Stock Status",
        "Selling Price (BDT)",
        "Inventory Valuation (BDT)",
      ];

      const rows = products.map((p) => {
        const status = p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "Healthy";
        const price = p.salePrice ?? p.regularPrice;
        const valuation = price * p.stock;
        return [
          `"${p.name.replace(/"/g, '""')}"`,
          `"${p.sku}"`,
          `"${p.category.name}"`,
          p.stock,
          `"${status}"`,
          price,
          valuation,
        ];
      });

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else if (type === "customers") {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        include: { orders: true },
      });

      const headers = [
        "Customer Name",
        "Phone",
        "Email",
        "City",
        "Address",
        "Total Orders Placed",
        "Lifetime Spend (BDT)",
        "Registration Date",
      ];

      const rows = customers.map((c) => {
        const lifetime = c.orders.reduce((sum, ord) => (ord.status !== "CANCELLED" ? sum + ord.total : sum), 0);
        return [
          `"${c.name.replace(/"/g, '""')}"`,
          `"${c.phone}"`,
          `"${c.email || ""}"`,
          `"${c.city || ""}"`,
          `"${(c.address || "").replace(/"/g, '""')}"`,
          c.orders.length,
          lifetime,
          `"${c.createdAt.toISOString()}"`,
        ];
      });

      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    await logAdminActivity(admin, "EXPORT_CSV", "REPORTS", type, { filename });

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV Export failed:", error);
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}

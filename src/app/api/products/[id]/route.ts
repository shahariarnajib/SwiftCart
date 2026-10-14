import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, logAdminActivity } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
      include: {
        category: true,
        images: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug: customSlug,
      sku,
      categoryId,
      regularPrice,
      salePrice,
      stock,
      description,
      specifications,
      isFeatured,
      isNewArrival,
      status,
      images,
    } = body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check SKU conflict
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findUnique({ where: { sku } });
      if (skuConflict) {
        return NextResponse.json({ error: "SKU is already used by another product" }, { status: 400 });
      }
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (customSlug) updateData.slug = slugify(customSlug);
    if (sku) updateData.sku = sku;
    if (categoryId) updateData.categoryId = categoryId;
    if (regularPrice !== undefined) updateData.regularPrice = parseFloat(regularPrice);
    if (salePrice !== undefined) {
      updateData.salePrice = salePrice === "" || salePrice === null ? null : parseFloat(salePrice);
    }
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (description !== undefined) updateData.description = description;
    if (specifications !== undefined) {
      updateData.specifications =
        typeof specifications === "object" ? JSON.stringify(specifications) : specifications;
    }
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isNewArrival !== undefined) updateData.isNewArrival = Boolean(isNewArrival);
    if (status) updateData.status = status;

    // Execute update in transaction if images are provided
    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: params.id },
        data: updateData,
      });

      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const url = typeof img === "string" ? img : img.url;
          if (url && url.trim()) {
            await tx.productImage.create({
              data: {
                productId: params.id,
                url: url.trim(),
                altText: typeof img === "object" ? img.altText : name || prod.name,
                isPrimary: i === 0,
                orderIndex: i,
              },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id: params.id },
        include: { category: true, images: true },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, sku: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Atomically unlink from order items, remove relations, and delete product
    await prisma.$transaction(async (tx) => {
      // 1. Unlink historical order items (order items retain product snapshot info)
      await tx.orderItem.updateMany({
        where: { productId: params.id },
        data: { productId: null },
      });

      // 2. Delete inventory movements associated with this product
      await tx.inventoryMovement.deleteMany({
        where: { productId: params.id },
      });

      // 3. Delete product variants
      await tx.productVariant.deleteMany({
        where: { productId: params.id },
      });

      // 4. Delete product images
      await tx.productImage.deleteMany({
        where: { productId: params.id },
      });

      // 5. Delete the product
      await tx.product.delete({
        where: { id: params.id },
      });
    });

    await logAdminActivity(
      admin,
      "DELETE_PRODUCT",
      "PRODUCT",
      params.id,
      { name: existingProduct.name, sku: existingProduct.sku }
    );

    return NextResponse.json({ success: true, message: `Product "${existingProduct.name}" deleted successfully.` });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

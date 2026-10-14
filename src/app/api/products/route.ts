import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const featured = searchParams.get("featured");
    const isNew = searchParams.get("new");
    const status = searchParams.get("status") || "ACTIVE";
    const sort = searchParams.get("sort") || "newest";
    const pageParam = searchParams.get("page");
    const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const skip = page && limit ? (page - 1) * limit : undefined;

    const where: Record<string, any> = {};

    // Filter by status (unless admin requests "ALL")
    if (status !== "ALL") {
      where.status = status;
    }

    // Filter by Category
    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    // Filter by Featured
    if (featured === "true") {
      where.isFeatured = true;
    }

    // Filter by New Arrival
    if (isNew === "true") {
      where.isNewArrival = true;
    }

    // Search query by name, description, or SKU
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    // Sorting
    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { regularPrice: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { regularPrice: "desc" };
    } else if (sort === "name") {
      orderBy = { name: "asc" };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { orderIndex: "asc" },
          },
        },
      }),
    ]);

    if (searchParams.get("format") === "paginated" || searchParams.get("page")) {
      return NextResponse.json({
        products,
        pagination: {
          total,
          page: page || 1,
          limit: limit || total,
          totalPages: limit ? Math.ceil(total / limit) : 1,
        },
      });
    }

    return NextResponse.json(products, {
      headers: {
        "X-Total-Count": total.toString(),
        "X-Total-Pages": (limit ? Math.ceil(total / limit) : 1).toString(),
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    if (!name || !sku || !categoryId || regularPrice === undefined) {
      return NextResponse.json(
        { error: "Product name, SKU, category, and regular price are required." },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ error: "A product with this SKU already exists." }, { status: 400 });
    }

    let slug = customSlug ? slugify(customSlug) : slugify(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku: sku.trim(),
        categoryId,
        regularPrice: parseFloat(regularPrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock || "0", 10),
        description: description || "",
        specifications: typeof specifications === "object" ? JSON.stringify(specifications) : specifications,
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        status: status || "ACTIVE",
        images: {
          create: Array.isArray(images)
            ? images.map((img: string | { url: string; altText?: string }, index: number) => ({
                url: typeof img === "string" ? img : img.url,
                altText: typeof img === "object" ? img.altText : name,
                isPrimary: index === 0,
                orderIndex: index,
              }))
            : [],
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

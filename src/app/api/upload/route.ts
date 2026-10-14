import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
]);

export async function POST(req: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access: Please login as admin." }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;

    const allFiles: File[] = [];
    if (singleFile && singleFile instanceof File) {
      allFiles.push(singleFile);
    }
    for (const f of files) {
      if (f instanceof File && !allFiles.includes(f)) {
        allFiles.push(f);
      }
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      // Validate type
      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}. Only JPG, PNG, WEBP, GIF, and SVG images are allowed.` },
          { status: 400 }
        );
      }

      // Max size: 10MB per image
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 10MB per image.` },
          { status: 400 }
        );
      }

      const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
      const cleanBaseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .slice(0, 30);
      const uniqueFileName = `${cleanBaseName || "img"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${safeExt}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);

      uploadedUrls.push(`/uploads/${uniqueFileName}`);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("Direct image upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}

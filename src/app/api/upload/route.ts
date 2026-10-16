import { NextResponse } from "next/server";
import { getCurrentAdmin, verifyAdminToken } from "@/lib/auth";
import { uploadToSupabaseStorage } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "image/jfif",
  "image/pjpeg",
  "image/x-png",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".jfif",
  ".heic",
  ".heif",
]);

type StorageBucket = "product-images" | "category-images" | "banners" | "invoices";

export async function POST(req: Request) {
  try {
    // 1. Authenticate admin via cookie or bearer token
    let admin = await getCurrentAdmin();
    if (!admin) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const payload = verifyAdminToken(token);
        if (payload) {
          admin = payload;
        }
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized access: Please login as admin." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File | null;
    const requestedBucketRaw = (formData.get("bucket") as string) || "product-images";

    const validBuckets: StorageBucket[] = ["product-images", "category-images", "banners", "invoices"];
    const targetBucket: StorageBucket = validBuckets.includes(requestedBucketRaw as StorageBucket)
      ? (requestedBucketRaw as StorageBucket)
      : "product-images";

    const allFiles: File[] = [];
    if (singleFile && singleFile instanceof File) {
      allFiles.push(singleFile);
    }
    for (const f of files) {
      if (f instanceof File && !allFiles.some((item) => item.name === f.name && item.size === f.size)) {
        allFiles.push(f);
      }
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of allFiles) {
      const ext = path.extname(file.name).toLowerCase();
      const isMimeAllowed = ALLOWED_MIME_TYPES.has(file.type) || file.type.startsWith("image/");
      const isExtAllowed = ALLOWED_EXTENSIONS.has(ext);

      if (!isMimeAllowed && !isExtAllowed) {
        return NextResponse.json(
          {
            error: `Unsupported file type: ${file.name}. Only standard image formats (JPG, PNG, WEBP, GIF, SVG, AVIF) are supported.`,
          },
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

      const safeExt = isExtAllowed ? ext : ".jpg";
      const cleanBaseName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .slice(0, 30);
      const uniqueFileName = `${cleanBaseName || "img"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${safeExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || (safeExt === ".png" ? "image/png" : safeExt === ".webp" ? "image/webp" : "image/jpeg");

      // Attempt 1: Upload to Supabase Storage (Cloud Storage)
      let uploadedUrl: string | null = null;
      try {
        const { url, error } = await uploadToSupabaseStorage(
          targetBucket,
          uniqueFileName,
          buffer,
          mimeType
        );
        if (!error && url) {
          uploadedUrl = url;
        } else {
          console.warn(`Supabase Storage upload fallback for ${uniqueFileName}:`, error);
        }
      } catch (sbErr) {
        console.warn("Supabase Storage error, falling back to local disk:", sbErr);
      }

      // Attempt 2: Fallback to local disk /public/uploads
      if (!uploadedUrl) {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, buffer);
        uploadedUrl = `/uploads/${uniqueFileName}`;
      }

      uploadedUrls.push(uploadedUrl);
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

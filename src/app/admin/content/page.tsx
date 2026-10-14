import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ContentClient } from "./ContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [banners, announcementSetting] = await Promise.all([
    prisma.banner.findMany({
      orderBy: { orderIndex: "asc" },
    }),
    prisma.storeSetting.findUnique({
      where: { key: "announcement_text" },
    }),
  ]);

  const formattedBanners = banners.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return (
    <ContentClient
      initialBanners={formattedBanners}
      initialAnnouncement={announcementSetting?.value || ""}
    />
  );
}

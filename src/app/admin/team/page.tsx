import React from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamClient } from "./TeamClient";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [teamMembers, auditLogs] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    prisma.adminActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const formattedTeam = teamMembers.map((m) => ({
    ...m,
    lastLoginAt: m.lastLoginAt ? m.lastLoginAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  }));

  const formattedLogs = auditLogs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <TeamClient
      initialTeam={formattedTeam}
      initialLogs={formattedLogs}
      currentUserRole={admin.role}
      currentUserId={admin.id}
    />
  );
}

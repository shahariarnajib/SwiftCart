import React from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata = {
  title: "Admin Dashboard | Swift Cart",
  description: "Swift Cart Management Dashboard for orders, inventory, and catalog.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  return (
    <AdminLayoutClient adminUser={admin}>
      {children}
    </AdminLayoutClient>
  );
}

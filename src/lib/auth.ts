import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "swift-cart-secure-jwt-secret-key-2026";
const COOKIE_NAME = "swiftcart_admin_token";

export type AdminRole = "SUPER_ADMIN" | "ORDER_MANAGER" | "PRODUCT_MANAGER" | "CONTENT_MANAGER";

export interface AdminPayload {
  id: string;
  username: string;
  name?: string;
  email: string;
  role: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAdminToken(token);
  if (!payload) return null;

  try {
    // Verify that admin still exists and is ACTIVE
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, name: true, email: true, role: true, status: true },
    });

    if (!admin || admin.status === "INACTIVE") {
      return null;
    }

    return {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };
  } catch (error) {
    console.error("Error fetching current admin from DB, using token payload:", error);
    return payload;
  }
}

/**
 * Audit log helper: Records administrative actions into the database
 */
export async function logAdminActivity(
  admin: AdminPayload,
  action: string,
  entity: string,
  entityId?: string,
  details?: any
) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name || admin.username,
        action,
        entity,
        entityId: entityId || null,
        details: typeof details === "object" ? JSON.stringify(details) : details ? String(details) : null,
      },
    });
  } catch (error) {
    console.error("Failed to record admin activity log:", error);
  }
}

/**
 * Check if the admin has permission for a specific module
 */
export function canAccess(admin: AdminPayload | null, module: "orders" | "products" | "content" | "settings" | "team" | "reports"): boolean {
  if (!admin) return false;
  if (admin.role === "SUPER_ADMIN") return true;

  switch (module) {
    case "orders":
      return admin.role === "ORDER_MANAGER";
    case "products":
      return admin.role === "PRODUCT_MANAGER";
    case "content":
      return admin.role === "CONTENT_MANAGER";
    case "reports":
      return admin.role === "ORDER_MANAGER" || admin.role === "PRODUCT_MANAGER";
    case "settings":
    case "team":
      return false; // Only SUPER_ADMIN
    default:
      return false;
  }
}

export { COOKIE_NAME };

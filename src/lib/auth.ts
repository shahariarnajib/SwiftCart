import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "swift-cart-secure-jwt-secret-key-2026";
const COOKIE_NAME = "swiftcart_admin_token";

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

  // Verify that admin still exists in database
  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.id },
    select: { id: true, username: true, name: true, email: true, role: true },
  });

  return admin || null;
}

export { COOKIE_NAME };

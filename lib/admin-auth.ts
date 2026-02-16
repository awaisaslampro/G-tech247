import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admin_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const session = store.get(ADMIN_COOKIE_NAME)?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminPassword && session === adminPassword);
}

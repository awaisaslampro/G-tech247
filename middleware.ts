import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admin_session";
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!adminPassword || session !== adminPassword) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

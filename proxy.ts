import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy Convention (formerly middleware.ts)
 * Enforces session presence across protected route trees:
 * - /app/*         -> Tenant Operations Backoffice
 * - /superadmin/*  -> Platform SuperAdmin Control Plane
 * - /hq/*          -> Corporate HQ God-View
 * - /tech/*        -> Field Technician PWA (excluding /tech/login)
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("serviceos_token")?.value;
  const techToken = request.cookies.get("serviceos_tech_token")?.value || token;

  // 1. Allow public authentication endpoints & public customer portal
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/tech/login") ||
    pathname.startsWith("/s/") ||
    pathname === "/"
  ) {
    // If technician is already authenticated and visits /tech/login, redirect to /tech/jobs
    if (techToken && pathname === "/tech/login") {
      return NextResponse.redirect(new URL("/tech/jobs", request.url));
    }
    // If user is already authenticated and visits /login, redirect to their operations dashboard
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Field Technician PWA Protection
  if (pathname.startsWith("/tech")) {
    if (!techToken) {
      const techLoginUrl = new URL("/tech/login", request.url);
      techLoginUrl.searchParams.set("session_expired", "true");
      techLoginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(techLoginUrl);
    }
    return NextResponse.next();
  }

  // 3. Protect backoffice, superadmin, and hq portals
  const isProtectedRoute =
    pathname.startsWith("/app") ||
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/hq");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("session_expired", "true");
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/superadmin/:path*",
    "/hq/:path*",
    "/tech/:path*",
    "/login",
  ],
};

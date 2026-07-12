import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_TOKEN_NAME,
  OWNER_TOKEN_NAME,
  CUSTOMER_TOKEN_NAME,
  verifyToken,
} from "@/lib/auth/jwt";

const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];
const OWNER_ROUTES = ["/dashboard"];
const OWNER_API_ROUTES = ["/api/owner"];
const CUSTOMER_ROUTES = ["/profile"];
const CUSTOMER_API_ROUTES = ["/api/customer"];

function matchRoute(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

async function hasRole(token: string | undefined, role: string): Promise<boolean> {
  if (!token) return false;
  const session = await verifyToken(token);
  if (!session?.role) return false;
  if (role === "admin") {
    return session.role === "admin" || session.role === "super_admin" || session.role === "staff";
  }
  return session.role === role;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminSecret = process.env.ADMIN_SECRET_PATH || "5b08d37a8d376d3f97ec3972";

  // Secret admin path — require admin auth
  // Pattern: /[24-char-hex]/...  OR  /<ADMIN_SECRET>/...
  const isSecretPath = pathname === `/${adminSecret}` || pathname.startsWith(`/${adminSecret}/`);
  const isHexSecret = /^\/[0-9a-f]{24}(\/|$)/.test(pathname);
  if (isSecretPath || isHexSecret) {
    const token = request.cookies.get(ADMIN_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "admin"))) {
      // Not authenticated — redirect to admin login with secret path as redirect
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Authenticated — rewrite to /admin and add noindex
    const subPath = pathname.replace(/^\/[0-9a-f]{24}/, "") || "/";
    const rewritten = request.nextUrl.clone();
    rewritten.pathname = `/admin${subPath}`;
    const res = NextResponse.rewrite(rewritten);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Admin routes - require admin token
  if (matchRoute(pathname, ADMIN_ROUTES)) {
    if (pathname === "/admin/login") {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
    const token = request.cookies.get(ADMIN_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "admin"))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Admin API - require admin token
  if (matchRoute(pathname, ADMIN_API_ROUTES)) {
    const token = request.cookies.get(ADMIN_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "admin"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Owner dashboard - require owner token
  if (matchRoute(pathname, OWNER_ROUTES)) {
    if (pathname === "/dashboard/login" || pathname === "/dashboard/register") {
      return NextResponse.next();
    }
    const token = request.cookies.get(OWNER_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "owner"))) {
      return NextResponse.redirect(new URL("/dashboard/login", request.url));
    }
    return NextResponse.next();
  }

  // Owner API - require owner token
  if (matchRoute(pathname, OWNER_API_ROUTES)) {
    const token = request.cookies.get(OWNER_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "owner"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Customer routes
  if (matchRoute(pathname, CUSTOMER_ROUTES)) {
    const token = request.cookies.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "customer"))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (matchRoute(pathname, CUSTOMER_API_ROUTES)) {
    const token = request.cookies.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "customer"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/api/owner/:path*",
    "/profile/:path*",
    "/api/customer/:path*",
    // Secret admin path (24-char hex)
    "/([0-9a-f]{24})",
    "/([0-9a-f]{24})/:path*",
  ],
};

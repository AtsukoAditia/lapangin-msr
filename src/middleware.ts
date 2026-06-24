import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin routes that require authentication
const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];

// Customer-only routes
const CUSTOMER_ROUTES = ["/profile"];
const CUSTOMER_API_ROUTES = ["/api/customer"];

function isAdminRoute(pathname: string): boolean {
  // Match /admin/* but NOT /admin/login
  if (pathname === "/admin/login") return false;
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminApiRoute(pathname: string): boolean {
  return ADMIN_API_ROUTES.some((route) => pathname.startsWith(route));
}

function isCustomerRoute(pathname: string): boolean {
  return CUSTOMER_ROUTES.some((route) => pathname.startsWith(route));
}

function isCustomerApiRoute(pathname: string): boolean {
  return CUSTOMER_API_ROUTES.some((route) => pathname.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages (except login)
  if (isAdminRoute(pathname)) {
    const adminToken = request.cookies.get("admin_auth_token")?.value;
    if (!adminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API routes
  if (isAdminApiRoute(pathname)) {
    const adminToken = request.cookies.get("admin_auth_token")?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 }
      );
    }
  }

  // Protect customer profile pages
  if (isCustomerRoute(pathname)) {
    const customerToken = request.cookies.get("customer_token")?.value;
    if (!customerToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect customer API routes (loyalty etc.)
  if (isCustomerApiRoute(pathname)) {
    const customerToken = request.cookies.get("customer_token")?.value;
    if (!customerToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/profile/:path*",
    "/api/customer/:path*",
  ],
};
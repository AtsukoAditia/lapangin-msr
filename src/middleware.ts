import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_TOKEN_NAME,
  CUSTOMER_TOKEN_NAME,
  verifyToken,
} from "@/lib/auth/jwt";

const ADMIN_ROUTES = ["/admin"];
const ADMIN_API_ROUTES = ["/api/admin"];
const CUSTOMER_ROUTES = ["/profile"];
const CUSTOMER_API_ROUTES = ["/api/customer"];

function isAdminRoute(pathname: string): boolean {
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

async function hasRole(token: string | undefined, role: "admin" | "customer") {
  if (!token) return false;
  const session = await verifyToken(token);
  return session?.role === role;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname)) {
    const token = request.cookies.get(ADMIN_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "admin"))) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdminApiRoute(pathname)) {
    const token = request.cookies.get(ADMIN_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "admin"))) {
      return NextResponse.json(
        { error: "Unauthorized. Admin login required." },
        { status: 401 },
      );
    }
  }

  if (isCustomerRoute(pathname)) {
    const token = request.cookies.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "customer"))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isCustomerApiRoute(pathname)) {
    const token = request.cookies.get(CUSTOMER_TOKEN_NAME)?.value;
    if (!(await hasRole(token, "customer"))) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 },
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

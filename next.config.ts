import type { NextConfig } from "next";

const adminSecret = process.env.ADMIN_SECRET_PATH || "5b08d37a8d376d3f97ec3972";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['43.157.207.183'],
  async rewrites() {
    return [
      // Secret admin path rewrites to /admin
      // e.g. /5b08d37a8d376d3f97ec3972 → /admin
      // e.g. /5b08d37a8d376d3f97ec3972/bookings → /admin/bookings
      {
        source: `/${adminSecret}`,
        destination: '/admin',
      },
      {
        source: `/${adminSecret}/:path*`,
        destination: '/admin/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;

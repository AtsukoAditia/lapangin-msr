"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AdminSession {
  role: string;
  userId: string;
  email: string;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/bookings", label: "Booking", icon: "📋" },
  { href: "/admin/courts", label: "Lapangan", icon: "🏟️" },
  { href: "/admin/pricing", label: "Harga", icon: "💰" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/customers", label: "Pelanggan", icon: "👥" },
  { href: "/admin/notifications", label: "Notifikasi", icon: "🔔" },
  { href: "/admin/settings", label: "Pengaturan", icon: "⚙️" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(() => pathname !== "/admin/login");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const adminRoles = ["admin", "super_admin", "staff"];
        if (!data.user || !adminRoles.includes(data.user.role)) {
          router.push("/admin/login");
        } else {
          setSession(data.user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) router.push("/admin/login");
      });

    return () => { cancelled = true; };
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Login page - no layout wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-black text-2xl">⚡</span>
          </div>
          <p className="text-gray-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 bg-gray-900 shadow-lg">
        <div className="mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚡</span>
              </div>
              <span className="text-lg font-black text-white hidden sm:block">
                Arena<span className="text-emerald-400">Book</span>
              </span>
            </Link>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-gray-400 hidden sm:block">
                {session.email}
              </span>
            )}
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              🏠 Situs
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              🚪 Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex gap-6">
          {/* Sidebar nav - Desktop */}
          <nav className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sticky top-24">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Sidebar - Mobile overlay */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <nav className="fixed left-0 top-16 bottom-0 w-64 bg-white z-50 lg:hidden shadow-2xl overflow-y-auto">
                <div className="p-3">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin" &&
                          pathname.startsWith(item.href));

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                              isActive
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </nav>
            </>
          )}

          {/* Mobile bottom nav */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
            <div className="flex justify-around py-2">
              {navItems.slice(0, 5).map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "text-emerald-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[10px]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Main content */}
          <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
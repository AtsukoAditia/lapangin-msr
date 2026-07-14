"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OwnerLayoutProps {
  children: React.ReactNode;
}

interface OwnerSession {
  role: string;
  userId: string;
  email: string;
  ownerId: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/bookings", label: "Booking", icon: "📋" },
  { href: "/dashboard/courts", label: "Lapangan", icon: "🏟️" },
  { href: "/dashboard/venues", label: "Venue Saya", icon: "🏢" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/settings", label: "Pengaturan", icon: "⚙️" },
];

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<OwnerSession | null>(null);
  const [loading, setLoading] = useState(() => pathname !== "/dashboard/login" && pathname !== "/dashboard/register");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/login" || pathname === "/dashboard/register") {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.user || data.user.role !== "owner") {
          router.replace("/dashboard/login");
          return;
        }
        setSession(data.user);
      })
      .catch(() => {
        if (!cancelled) router.replace("/dashboard/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pathname, router]);

  // Login/register pages — no sidebar
  if (pathname === "/dashboard/login" || pathname === "/dashboard/register") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          <span className="font-black text-gray-900">Owner</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}>
          <div className="p-6 border-b border-gray-100">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-black text-lg">⚡</span>
              </div>
              <div>
                <h1 className="font-black text-gray-900 text-lg">Lapangin</h1>
                <p className="text-xs text-gray-500">Owner Dashboard</p>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-700 font-bold text-sm">{session.email[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{session.email}</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
              <button
                onClick={() => {
                  document.cookie = "owner_auth_token=; path=/; max-age=0";
                  router.replace("/dashboard/login");
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/bookings", label: "Booking", icon: "📋" },
  { href: "/admin/courts", label: "Lapangan", icon: "🏟️" },
  { href: "/admin/pricing", label: "Harga", icon: "💰" },
  { href: "/admin/notifications", label: "Notifikasi", icon: "🔔" },
  { href: "/admin/settings", label: "Pengaturan", icon: "⚙️" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/admin" className="text-lg font-bold text-slate-800">
            🏟️ Lapangin Admin
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-emerald-600"
          >
            ← Kembali ke Situs
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar nav */}
          <nav className="w-full shrink-0 md:w-48">
            <ul className="flex gap-1 overflow-x-auto md:flex-col">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" &&
                    pathname.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Main content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
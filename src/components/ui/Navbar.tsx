"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type User = {
  role: string;
  id: string;
  name: string;
  email?: string;
  points?: number;
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    const endpoint = user?.role === "admin" ? "/api/auth/admin/logout" : "/api/auth/customer/logout";
    await fetch(endpoint, { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) return null; // Admin has its own layout

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Arena<span className="text-emerald-600">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>
              🏠 Beranda
            </NavLink>
            <NavLink href="/booking/futsal" active={pathname.startsWith("/booking")}>
              📅 Booking
            </NavLink>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {user.role === "customer" && user.points !== undefined && (
                  <Link
                    href="/account/loyalty"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    ⭐ {user.points.toLocaleString()} Poin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-700 font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {user.role === "customer" && (
                      <>
                        <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          👤 Profil Saya
                        </Link>
                        <Link href="/account/loyalty" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          ⭐ Riwayat Poin
                        </Link>
                        <Link href="/account/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          📋 Booking Saya
                        </Link>
                      </>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        ⚙️ Dashboard Admin
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Keluar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <MobileNavLink href="/" onClick={() => setMobileOpen(false)}>
              🏠 Beranda
            </MobileNavLink>
            <MobileNavLink href="/booking/futsal" onClick={() => setMobileOpen(false)}>
              📅 Booking Lapangan
            </MobileNavLink>

            {user ? (
              <>
                <hr className="my-2 border-gray-100" />
                {user.role === "customer" && user.points !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                    <span>⭐</span>
                    <span className="text-sm font-semibold text-amber-700">
                      {user.points.toLocaleString()} Poin
                    </span>
                  </div>
                )}
                {user.role === "customer" && (
                  <>
                    <MobileNavLink href="/account" onClick={() => setMobileOpen(false)}>
                      👤 Profil Saya
                    </MobileNavLink>
                    <MobileNavLink href="/account/loyalty" onClick={() => setMobileOpen(false)}>
                      ⭐ Riwayat Poin
                    </MobileNavLink>
                    <MobileNavLink href="/account/bookings" onClick={() => setMobileOpen(false)}>
                      📋 Booking Saya
                    </MobileNavLink>
                  </>
                )}
                {user.role === "admin" && (
                  <MobileNavLink href="/admin" onClick={() => setMobileOpen(false)}>
                    ⚙️ Dashboard Admin
                  </MobileNavLink>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  🚪 Keluar
                </button>
              </>
            ) : (
              <>
                <hr className="my-2 border-gray-100" />
                <MobileNavLink href="/login" onClick={() => setMobileOpen(false)}>
                  🔑 Masuk
                </MobileNavLink>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg mt-2"
                >
                  ✨ Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
    >
      {children}
    </Link>
  );
}
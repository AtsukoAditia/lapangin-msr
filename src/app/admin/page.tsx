"use client";

import { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useStaggerReveal } from "@/lib/animations";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
  totalCourts: number;
  activeCourts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const actionsGridRef = useRef<HTMLDivElement>(null);
  useStaggerReveal(statsGridRef, { count: 6, delay: 80 });
  useStaggerReveal(actionsGridRef, { count: 4, delay: 100 });

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const [bookingsRes, courtsRes] = await Promise.all([
          fetch("/api/admin/bookings"),
          fetch("/api/admin/courts"),
        ]);
        const bookingsData = await bookingsRes.json();
        const courtsData = await courtsRes.json();
        const bookings = bookingsData.bookings ?? [];
        const courts = courtsData.courts ?? [];
        if (!cancelled) {
          setStats({
            totalBookings: bookings.length,
            pendingBookings: bookings.filter(
              (b: { bookingStatus: string }) => b.bookingStatus === "pending"
            ).length,
            confirmedBookings: bookings.filter(
              (b: { bookingStatus: string }) =>
                b.bookingStatus === "confirmed" || b.bookingStatus === "paid"
            ).length,
            totalRevenue: bookings
              .filter(
                (b: { bookingStatus: string }) =>
                  b.bookingStatus === "confirmed" || b.bookingStatus === "paid"
              )
              .reduce(
                (sum: number, b: { totalPrice: number }) => sum + b.totalPrice,
                0
              ),
            totalCourts: courts.length,
            activeCourts: courts.filter(
              (c: { isActive: boolean }) => c.isActive
            ).length,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout>
      {/* Welcome Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-blue-500 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">🏟️ Dashboard</h1>
            <p className="mt-1 text-sm text-indigo-100">
              Pantau performa venue olahraga kamu secara real-time
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-lg">📊</span>
            <span className="text-sm font-semibold text-white">Live Overview</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : !stats ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="mt-2 font-semibold text-red-700">Gagal memuat data dashboard</p>
          <p className="text-sm text-red-500">Coba refresh halaman</p>
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div ref={statsGridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon="📋"
              label="Total Booking"
              value={stats.totalBookings.toString()}
              gradient="from-blue-500 to-blue-600"
              light="bg-blue-50 text-blue-700"
              link="/admin/bookings"
            />
            <StatCard
              icon="⏳"
              label="Menunggu Konfirmasi"
              value={stats.pendingBookings.toString()}
              gradient="from-amber-500 to-orange-500"
              light="bg-amber-50 text-amber-700"
              link="/admin/bookings"
              highlight={stats.pendingBookings > 0}
            />
            <StatCard
              icon="✅"
              label="Booking Dikonfirmasi"
              value={stats.confirmedBookings.toString()}
              gradient="from-emerald-500 to-teal-500"
              light="bg-emerald-50 text-emerald-700"
            />
            <StatCard
              icon="💰"
              label="Total Pendapatan"
              value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
              gradient="from-primary-500 to-primary-600"
              light="bg-primary-50 text-primary-700"
            />
            <StatCard
              icon="🏟️"
              label="Total Lapangan"
              value={stats.totalCourts.toString()}
              gradient="from-slate-500 to-slate-600"
              light="bg-slate-100 text-slate-700"
              link="/admin/courts"
            />
            <StatCard
              icon="🟢"
              label="Lapangan Aktif"
              value={stats.activeCourts.toString()}
              gradient="from-green-500 to-emerald-500"
              light="bg-green-50 text-green-700"
              link="/admin/courts"
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-slate-800">⚡ Aksi Cepat</h2>
            <div ref={actionsGridRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction href="/admin/bookings" icon="📋" label="Kelola Booking" color="from-blue-500 to-indigo-500" />
              <QuickAction href="/admin/courts" icon="🏟️" label="Kelola Lapangan" color="from-emerald-500 to-teal-500" />
              <QuickAction href="/admin/pricing" icon="💰" label="Atur Harga" color="from-amber-500 to-orange-500" />
              <QuickAction href="/admin/notifications" icon="🔔" label="Notifikasi" color="from-primary-500 to-accent-500" />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
  light,
  link,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  gradient: string;
  light: string;
  link?: string;
  highlight?: boolean;
}) {
  const card = (
    <div className={`reveal-item group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${highlight ? "border-amber-300 ring-2 ring-amber-200" : "border-slate-200"}`}>
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${light}`}>
            {icon}
          </div>
          {highlight && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs text-white animate-pulse">!</span>
          )}
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );

  if (link) {
    return <a href={link}>{card}</a>;
  }
  return card;
}

function QuickAction({ href, icon, label, color }: { href: string; icon: string; label: string; color: string }) {
  return (
    <a
      href={href}
      className={`reveal-item group flex items-center gap-3 rounded-xl bg-gradient-to-r ${color} p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <span className="text-2xl transition group-hover:scale-110">{icon}</span>
      <span className="text-sm font-bold">{label}</span>
    </a>
  );
}

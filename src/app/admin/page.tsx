"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

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
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch stats:", err);
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : !stats ? (
        <p className="text-slate-500">Gagal memuat data dashboard.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon="📋"
            label="Total Booking"
            value={stats.totalBookings.toString()}
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            icon="⏳"
            label="Menunggu Konfirmasi"
            value={stats.pendingBookings.toString()}
            color="bg-amber-50 text-amber-700"
          />
          <StatCard
            icon="✅"
            label="Booking Dikonfirmasi"
            value={stats.confirmedBookings.toString()}
            color="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            icon="💰"
            label="Total Pendapatan"
            value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
            color="bg-purple-50 text-purple-700"
          />
          <StatCard
            icon="🏟️"
            label="Total Lapangan"
            value={stats.totalCourts.toString()}
            color="bg-slate-50 text-slate-700"
          />
          <StatCard
            icon="🟢"
            label="Lapangan Aktif"
            value={stats.activeCourts.toString()}
            color="bg-green-50 text-green-700"
          />
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm opacity-70">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import BarChart from "@/components/charts/BarChart";

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalBookings: number;
    avgBookingValue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    monthlyGrowth: number;
  };
  revenueByDate: { date: string; revenue: number; bookings: number }[];
  revenueByHour: { hour: number; revenue: number; bookings: number }[];
  revenueByCourt: { name: string; venue: string; revenue: number; bookings: number }[];
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export default function AnalyticsPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics/revenue")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-gray-500">Gagal memuat data analytics</div>
      </AdminLayout>
    );
  }

  const { summary, revenueByDate, revenueByHour, revenueByCourt } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
          <p className="text-gray-500 text-sm">Analisis pendapatan dan performa venue</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(summary.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Total Booking</p>
            <p className="text-xl font-bold text-gray-900">{summary.totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Rata-rata/Booking</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(summary.avgBookingValue)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500 mb-1">Growth Bulan Ini</p>
            <p className={`text-xl font-bold ${summary.monthlyGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {summary.monthlyGrowth >= 0 ? "+" : ""}{summary.monthlyGrowth}%
            </p>
          </div>
        </div>

        {/* Revenue by Date */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue 30 Hari Terakhir</h2>
          <BarChart
            data={revenueByDate.map((d) => ({ label: formatDate(d.date), value: d.revenue }))}
            height={180}
            formatValue={formatPrice}
          />
        </div>

        {/* Revenue by Hour (Peak Hours) */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Peak Hours</h2>
          <BarChart
            data={revenueByHour
              .filter((h) => h.revenue > 0)
              .map((h) => ({
                label: `${String(h.hour).padStart(2, "0")}:00`,
                value: h.revenue,
              }))}
            height={150}
            color="#f59e0b"
            formatValue={formatPrice}
          />
        </div>

        {/* Revenue by Court */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue per Court</h2>
          {revenueByCourt.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {revenueByCourt.map((court, i) => {
                const maxRev = revenueByCourt[0]?.revenue || 1;
                const pct = (court.revenue / maxRev) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">
                        {court.name} <span className="text-gray-400">({court.venue})</span>
                      </span>
                      <span className="font-medium text-gray-900">{formatPrice(court.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{court.bookings} booking</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

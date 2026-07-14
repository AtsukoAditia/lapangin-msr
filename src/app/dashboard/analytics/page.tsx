"use client";

import { useEffect, useState } from "react";
import BarChart from "@/components/charts/BarChart";

interface RevenueByCourt {
  label: string;
  value: number;
  venueName: string;
}

interface RevenueByMonth {
  label: string;
  value: number;
}

interface RecentBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  courtName: string;
  venueName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingStatus: string;
  paymentStatus: string;
}

interface TopCustomer {
  name: string;
  phone: string;
  totalSpent: number;
  bookingCount: number;
}

interface AnalyticsData {
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalBookings: number;
  occupancyRate: number;
  revenueByCourt: RevenueByCourt[];
  revenueByMonth: RevenueByMonth[];
  recentBookings: RecentBooking[];
  topCustomers: TopCustomer[];
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_COLORS: Record<string, string> = {
  waiting_payment: "bg-amber-100 text-amber-800",
  waiting_verification: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-500",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  waiting_payment: "Menunggu Bayar",
  waiting_verification: "Verifikasi",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  rejected: "Ditolak",
};

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const revenueChange =
    data?.revenueLastMonth
      ? Math.round(
          ((data.revenueThisMonth - data.revenueLastMonth) /
            data.revenueLastMonth) *
            100,
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan pendapatan dan performa venue Anda
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-lg">
              💰
            </div>
            <span className="text-sm font-medium text-gray-500">
              Bulan Ini
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatPrice(data?.revenueThisMonth ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {revenueChange >= 0 ? "↑" : "↓"} {Math.abs(revenueChange)}% vs
            bulan lalu
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg">
              📋
            </div>
            <span className="text-sm font-medium text-gray-500">
              Total Booking
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {data?.totalBookings ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Semua booking</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg">
              📊
            </div>
            <span className="text-sm font-medium text-gray-500">
              Occupancy Rate
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {data?.occupancyRate ?? 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">30 hari terakhir</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-lg">
              📈
            </div>
            <span className="text-sm font-medium text-gray-500">
              Bulan Lalu
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            {formatPrice(data?.revenueLastMonth ?? 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Referensi</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pendapatan per Bulan
          </h2>
          <BarChart
            data={data?.revenueByMonth ?? []}
            height={180}
            formatValue={(v) => formatPrice(v)}
          />
        </div>

        {/* Revenue by Court */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pendapatan per Lapangan
          </h2>
          <BarChart
            data={(data?.revenueByCourt ?? []).map((c) => ({
              label: c.label,
              value: c.value,
            }))}
            height={180}
            color="#8b5cf6"
            formatValue={(v) => formatPrice(v)}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Booking Terbaru
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    Kode
                  </th>
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    Pelanggan
                  </th>
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    Lapangan
                  </th>
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    Status
                  </th>
                  <th className="text-right px-6 py-2 text-xs font-bold text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.recentBookings ?? []).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs">
                      {b.bookingCode}
                    </td>
                    <td className="px-6 py-3">{b.customerName}</td>
                    <td className="px-6 py-3 text-gray-500">{b.courtName}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          STATUS_COLORS[b.bookingStatus] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[b.bookingStatus] ?? b.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                      {formatPrice(b.totalPrice)}
                    </td>
                  </tr>
                ))}
                {(data?.recentBookings ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      Belum ada booking
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Top Pelanggan
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    #
                  </th>
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    Nama
                  </th>
                  <th className="text-left px-6 py-2 text-xs font-bold text-gray-500">
                    Booking
                  </th>
                  <th className="text-right px-6 py-2 text-xs font-bold text-gray-500">
                    Total Bayar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.topCustomers ?? []).map((c, i) => (
                  <tr key={c.phone} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-400 font-bold">
                      {i + 1}
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {c.bookingCount}x
                    </td>
                    <td className="px-6 py-3 text-right font-bold">
                      {formatPrice(c.totalSpent)}
                    </td>
                  </tr>
                ))}
                {(data?.topCustomers ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      Belum ada data pelanggan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

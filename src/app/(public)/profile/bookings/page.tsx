"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BookingItem {
  id: string;
  booking_code: string;
  customer_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  booking_status: string;
  payment_status: string;
  venue_name: string;
  court_name: string;
  sport_name: string;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  waiting_payment: "bg-yellow-100 text-yellow-700",
  waiting_verification: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-700",
  no_show: "bg-gray-100 text-gray-700",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
  waiting_payment: "Menunggu Bayar",
  waiting_verification: "Verifikasi",
  cancelled: "Dibatalkan",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  no_show: "No Show",
  pending: "Pending",
};

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatPrice(p: number) {
  return `Rp ${p?.toLocaleString("id-ID")}`;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const fetchBookings = () => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/customer/bookings${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.bookings) setBookings(data.bookings);
        else if (data?.error === "Unauthorized") router.push("/login");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/profile" className="text-emerald-600 text-sm hover:underline">← Profil</Link>
            <h1 className="text-lg font-bold mt-1">Booking Saya</h1>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="waiting_payment">Menunggu Bayar</option>
            <option value="waiting_verification">Verifikasi</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">Belum ada booking</p>
            <Link href="/booking" className="text-emerald-600 text-sm hover:underline mt-2 inline-block">
              Booking sekarang
            </Link>
          </div>
        ) : (
          bookings.map((b) => (
            <Link
              key={b.id}
              href={`/profile/bookings/${b.booking_code}`}
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-sm text-gray-500">{b.booking_code}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[b.booking_status] || "bg-gray-100 text-gray-700"}`}>
                  {STATUS_LABEL[b.booking_status] || b.booking_status}
                </span>
              </div>
              <p className="font-semibold text-gray-900">{b.venue_name} — {b.court_name}</p>
              <p className="text-sm text-gray-600">{b.sport_name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>📅 {formatDate(b.booking_date)}</span>
                <span>🕐 {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</span>
              </div>
              <p className="text-emerald-600 font-bold mt-2">{formatPrice(b.total_price)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

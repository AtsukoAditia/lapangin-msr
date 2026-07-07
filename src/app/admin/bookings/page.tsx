"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import type { Booking } from "@/lib/types/domain";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800" },
  waiting_payment: {
    label: "Tunggu Bayar",
    color: "bg-orange-100 text-orange-800",
  },
  waiting_verification: {
    label: "Verifikasi Pembayaran",
    color: "bg-purple-100 text-purple-800",
  },
  paid: { label: "Dibayar", color: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Dikonfirmasi", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Dibatalkan", color: "bg-gray-100 text-gray-800" },
  expired: { label: "Kadaluarsa", color: "bg-stone-100 text-stone-800" },
  completed: { label: "Selesai", color: "bg-green-100 text-green-800" },
  no_show: { label: "No Show", color: "bg-stone-100 text-stone-800" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      return (data.bookings ?? []) as Booking[];
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      return [] as Booking[];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchBookings().then((result) => {
      if (!cancelled) {
        setBookings(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchBookings]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal update status");
        return;
      }

      setBookings(await fetchBookings());
    } catch (err) {
      console.error("Failed to update:", err);
      alert("Gagal update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmPayment(id: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal konfirmasi pembayaran");
        return;
      }

      setBookings(await fetchBookings());
    } catch (err) {
      console.error("Failed to confirm payment:", err);
      alert("Gagal konfirmasi pembayaran");
    } finally {
      setUpdatingId(null);
    }
  }

  async function rejectPayment(id: string) {
    if (!confirm("Tolak bukti pembayaran ini? Booking akan kembali ke status menunggu.")) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal tolak pembayaran");
        return;
      }

      setBookings(await fetchBookings());
    } catch (err) {
      console.error("Failed to reject payment:", err);
      alert("Gagal tolak pembayaran");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered =
    filterStatus === "all"
      ? bookings
      : bookings.filter((b) => b.bookingStatus === filterStatus);

  // Count by status for filter badges
  const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.bookingStatus] = (acc[b.bookingStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-xl sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">📋 Kelola Booking</h1>
            <p className="mt-1 text-sm text-blue-100">
              {bookings.length} total booking · {statusCounts.pending ?? 0} menunggu konfirmasi
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="text-lg">🔄</span>
            <button
              onClick={async () => {
                setLoading(true);
                const result = await fetchBookings();
                setBookings(result);
                setLoading(false);
              }}
              className="text-sm font-semibold text-white hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          label="Semua"
          count={bookings.length}
          active={filterStatus === "all"}
          onClick={() => setFilterStatus("all")}
          color="bg-slate-600"
        />
        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
          (statusCounts[key] ?? 0) > 0 && (
            <FilterChip
              key={key}
              label={label}
              count={statusCounts[key] ?? 0}
              active={filterStatus === key}
              onClick={() => setFilterStatus(key)}
              color={
                key === "pending" ? "bg-amber-500" :
                key === "waiting_payment" ? "bg-orange-500" :
                key === "waiting_verification" ? "bg-purple-500" :
                key === "paid" ? "bg-blue-500" :
                key === "confirmed" ? "bg-emerald-500" :
                key === "rejected" ? "bg-red-500" :
                key === "cancelled" ? "bg-slate-500" :
                key === "expired" ? "bg-stone-500" :
                key === "completed" ? "bg-green-500" :
                "bg-stone-500"
              }
            />
          )
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-4xl">📋</div>
          <p className="text-lg font-bold text-slate-700">Belum ada booking</p>
          <p className="mt-1 text-sm text-slate-500">Booking akan muncul di sini setelah pelanggan melakukan pemesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const statusCfg = STATUS_CONFIG[booking.bookingStatus] ?? {
              label: booking.bookingStatus,
              color: "bg-gray-100 text-gray-800",
            };

            return (
              <div
                key={booking.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Status bar top */}
                <div className={`h-1 ${
                  booking.bookingStatus === "confirmed" || booking.bookingStatus === "paid" ? "bg-emerald-500" :
                  booking.bookingStatus === "pending" ? "bg-amber-500" :
                  booking.bookingStatus === "waiting_payment" ? "bg-orange-500" :
                  booking.bookingStatus === "waiting_verification" ? "bg-purple-500" :
                  booking.bookingStatus === "rejected" || booking.bookingStatus === "cancelled" ? "bg-red-400" :
                  booking.bookingStatus === "expired" ? "bg-stone-400" :
                  booking.bookingStatus === "completed" ? "bg-blue-500" :
                  "bg-slate-300"
                }`} />

                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Booking Info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700">
                          🏷️ {booking.bookingCode}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-sm">👤</span>
                          <div>
                            <p className="text-xs text-slate-500">Pelanggan</p>
                            <p className="text-sm font-semibold text-slate-800">{booking.customerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-sm">📞</span>
                          <div>
                            <p className="text-xs text-slate-500">Telepon</p>
                            <p className="text-sm font-semibold text-slate-800">{booking.customerPhone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-sm">📅</span>
                          <div>
                            <p className="text-xs text-slate-500">Jadwal</p>
                            <p className="text-sm font-semibold text-slate-800">
                              {booking.bookingDate} · {booking.startTime}–{booking.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-sm">💰</span>
                          <div>
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="text-sm font-extrabold text-emerald-600">
                              Rp {booking.totalPrice.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment proof */}
                      {booking.paymentProofUrl && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                          <span className="text-sm">📎</span>
                          <span className="text-xs font-medium text-blue-700">Bukti transfer sudah diupload</span>
                          <a
                            href={booking.paymentProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs font-bold text-blue-600 hover:underline"
                          >
                            Lihat Bukti →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                      {booking.bookingStatus === "waiting_verification" &&
                        booking.paymentProofUrl && (
                          <>
                            <button
                              disabled={updatingId === booking.id}
                              onClick={() => confirmPayment(booking.id)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
                            >
                              {updatingId === booking.id ? "⏳" : "✅"} Konfirmasi Bayar
                            </button>
                            <button
                              disabled={updatingId === booking.id}
                              onClick={() => rejectPayment(booking.id)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-red-600 hover:to-rose-600 disabled:opacity-50"
                            >
                              ❌ Tolak Bayar
                            </button>
                          </>
                      )}
                      {booking.bookingStatus === "pending" && (
                        <>
                          <button
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
                          >
                            {updatingId === booking.id ? "⏳" : "✅"} Konfirmasi
                          </button>
                          <button
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "rejected")}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-red-600 hover:to-rose-600 disabled:opacity-50"
                          >
                            ❌ Tolak
                          </button>
                        </>
                      )}
                      {booking.bookingStatus === "confirmed" && (
                        <button
                          disabled={updatingId === booking.id}
                          onClick={() => updateStatus(booking.id, "completed")}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
                        >
                          ✔️ Selesai
                        </button>
                      )}
                      {(booking.bookingStatus === "pending" ||
                        booking.bookingStatus === "waiting_payment") && (
                        <button
                          disabled={updatingId === booking.id}
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          className="flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          🚫 Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
        active
          ? `${color} text-white shadow-md`
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/20" : "bg-slate-100"}`}>
        {count}
      </span>
    </button>
  );
}

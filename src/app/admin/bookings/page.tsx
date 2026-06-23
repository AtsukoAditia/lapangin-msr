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
  paid: { label: "Dibayar", color: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Dikonfirmasi", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Dibatalkan", color: "bg-gray-100 text-gray-800" },
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

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Booking</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-4xl">📋</p>
          <p className="mt-2 text-slate-500">Belum ada booking</p>
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
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {booking.bookingCode}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.color}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">{booking.customerName}</span>
                      {" · "}
                      {booking.customerPhone}
                    </p>
                    <p className="text-sm text-slate-500">
                      {booking.bookingDate} · {booking.startTime}–{booking.endTime}
                      {" · "}
                      {booking.durationMinutes} menit
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      Rp {booking.totalPrice.toLocaleString("id-ID")}
                    </p>
                  </div>

                  {/* Payment proof indicator */}
                  {booking.paymentProofUrl && (
                    <div className="mb-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                      📎 Bukti pembayaran sudah diupload
                      <a
                        href={booking.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline hover:text-blue-900"
                      >
                        Lihat Bukti →
                      </a>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {booking.bookingStatus === "waiting_payment" &&
                      booking.paymentProofUrl && (
                        <>
                          <button
                            disabled={updatingId === booking.id}
                            onClick={() => confirmPayment(booking.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            ✅ Konfirmasi Bayar
                          </button>
                          <button
                            disabled={updatingId === booking.id}
                            onClick={() => rejectPayment(booking.id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          ✅ Konfirmasi
                        </button>
                        <button
                          disabled={updatingId === booking.id}
                          onClick={() => updateStatus(booking.id, "rejected")}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          ❌ Tolak
                        </button>
                      </>
                    )}
                    {booking.bookingStatus === "confirmed" && (
                      <button
                        disabled={updatingId === booking.id}
                        onClick={() => updateStatus(booking.id, "completed")}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        ✔️ Selesai
                      </button>
                    )}
                    {(booking.bookingStatus === "pending" ||
                      booking.bookingStatus === "waiting_payment") && (
                      <button
                        disabled={updatingId === booking.id}
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 disabled:opacity-50"
                      >
                        Batalkan
                      </button>
                    )}
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
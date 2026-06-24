"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import BookingSteps from "@/components/booking/BookingSteps";
import type { Booking, PaymentMethod } from "@/lib/types/domain";

const POLL_INTERVAL_MS = 5000;

type PublicBooking = Pick<
  Booking,
  | "id"
  | "bookingCode"
  | "customerName"
  | "venueId"
  | "courtId"
  | "sportId"
  | "bookingDate"
  | "startTime"
  | "endTime"
  | "durationMinutes"
  | "totalPrice"
  | "bookingStatus"
  | "paymentStatus"
  | "expiresAt"
  | "createdAt"
  | "updatedAt"
>;

const POLLABLE_STATUSES: Booking["bookingStatus"][] = [
  "waiting_payment",
  "waiting_verification",
];

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getHeader(booking: PublicBooking | null) {
  if (!booking) {
    return {
      title: "Cek Status Booking",
      subtitle: "Gunakan kode booking untuk melihat status terbaru.",
    };
  }

  if (booking.bookingStatus === "confirmed") {
    return {
      title: "Booking Dikonfirmasi!",
      subtitle: "Pembayaran sudah diverifikasi dan jadwal sudah valid.",
    };
  }

  if (booking.bookingStatus === "waiting_payment") {
    return {
      title: "Booking Sementara Dibuat",
      subtitle:
        "Selesaikan pembayaran sebelum waktu habis. Jadwal belum final sampai admin mengonfirmasi.",
    };
  }

  if (booking.bookingStatus === "waiting_verification") {
    return {
      title: "Menunggu Verifikasi",
      subtitle: "Bukti pembayaran sudah diterima dan sedang diperiksa admin.",
    };
  }

  return {
    title: "Status Booking",
    subtitle: "Lihat status terbaru booking kamu di halaman ini.",
  };
}

function getStatusCard(
  booking: PublicBooking,
  countdown: number | null,
): {
  icon: string;
  title: string;
  body: string;
  className: string;
  countdownText?: string;
} {
  switch (booking.bookingStatus) {
    case "waiting_payment":
      return {
        icon: "⏳",
        title: "Menunggu Pembayaran",
        body:
          "Booking masih sementara. Slot ditahan sampai countdown selesai dan baru valid setelah admin mengonfirmasi pembayaran.",
        className: "border-amber-200 bg-amber-50 text-amber-800",
        countdownText: countdown === null ? "15:00" : formatCountdown(countdown),
      };
    case "waiting_verification":
      return {
        icon: "🔍",
        title: "Menunggu Verifikasi Admin",
        body:
          "Bukti transfer sudah diterima. Admin sedang memverifikasi pembayaranmu.",
        className: "border-blue-200 bg-blue-50 text-blue-800",
      };
    case "confirmed":
      return {
        icon: "✅",
        title: "Booking Dikonfirmasi",
        body: "Pembayaran sudah diverifikasi. Jadwal sudah valid.",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      };
    case "expired":
      return {
        icon: "⏰",
        title: "Booking Kadaluarsa",
        body: "Waktu pembayaran telah habis. Silakan buat booking baru.",
        className: "border-red-200 bg-red-50 text-red-800",
      };
    case "rejected":
      return {
        icon: "❌",
        title: "Booking Ditolak",
        body: "Pembayaran tidak dapat diverifikasi. Silakan hubungi admin.",
        className: "border-red-200 bg-red-50 text-red-800",
      };
    case "cancelled":
      return {
        icon: "🚫",
        title: "Booking Dibatalkan",
        body: "Booking ini sudah dibatalkan. Silakan buat booking baru.",
        className: "border-slate-200 bg-slate-50 text-slate-800",
      };
    default:
      return {
        icon: "📌",
        title: "Booking Terkirim",
        body: "Status booking sedang diperbarui.",
        className: "border-slate-200 bg-white text-slate-800",
      };
  }
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("code") ?? "";

  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [error, setError] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [loading, setLoading] = useState(Boolean(bookingCode));
  const [countdown, setCountdown] = useState<number | null>(null);
  const expiryRefreshRef = useRef(false);

  const fetchBooking = useCallback(async () => {
    if (!bookingCode) return null;

    try {
      const res = await fetch(`/api/bookings/${bookingCode}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data: PublicBooking = await res.json();
        setBooking(data);
        return data;
      }

      if (res.status === 404) {
        setBooking(null);
      }
    } catch {
      /* polling should not break the page */
    }

    return null;
  }, [bookingCode]);

  useEffect(() => {
    if (!bookingCode) return;

    const controller = new AbortController();

    async function loadInitialData() {
      try {
        const [bookingRes, paymentMethodsRes] = await Promise.all([
          fetch(`/api/bookings/${bookingCode}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch("/api/payments/methods", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (bookingRes.ok) {
          setBooking(await bookingRes.json());
        } else if (bookingRes.status === 404) {
          setBooking(null);
        }

        if (paymentMethodsRes.ok) {
          const data = await paymentMethodsRes.json();
          setPaymentMethods(data.methods ?? []);
        }
      } catch {
        /* network error state is handled by keeping booking null */
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();

    return () => controller.abort();
  }, [bookingCode]);

  useEffect(() => {
    if (!booking || !POLLABLE_STATUSES.includes(booking.bookingStatus)) return;

    const intervalId = setInterval(() => {
      void fetchBooking();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [booking, fetchBooking]);

  useEffect(() => {
    if (!booking?.expiresAt || booking.bookingStatus !== "waiting_payment") {
      expiryRefreshRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- countdown is derived from booking status
      setCountdown(null);
      return;
    }

    expiryRefreshRef.current = false;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(booking.expiresAt!).getTime() - Date.now()) / 1000,
        ),
      );

      setCountdown(remaining);

      if (remaining === 0 && !expiryRefreshRef.current) {
        expiryRefreshRef.current = true;
        void fetchBooking();
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [booking?.expiresAt, booking?.bookingStatus, fetchBooking]);

  async function submitProof() {
    if (!booking) return;

    if (!proofUrl.trim()) {
      setError("Masukkan link bukti transfer.");
      return;
    }

    try {
      new URL(proofUrl);
    } catch {
      setError("Format URL tidak valid. Contoh: https://drive.google.com/...");
      return;
    }

    setSubmittingProof(true);
    setError("");

    try {
      const res = await fetch("/api/payments/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          proofUrl: proofUrl.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim bukti transfer.");
      }

      setProofSubmitted(true);
      await fetchBooking();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim bukti transfer.");
    } finally {
      setSubmittingProof(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-slate-500">Memuat booking...</p>
        </div>
      </div>
    );
  }

  if (!bookingCode) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 text-center">
        <div>
          <p className="text-3xl">🔎</p>
          <h1 className="mt-2 text-lg font-bold text-slate-900">
            Kode Booking Belum Ada
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Silakan mulai booking dari halaman pemesanan.
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            Buat Booking Baru
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-50 px-4 text-center">
        <div>
          <p className="text-3xl">🔍</p>
          <h1 className="mt-2 text-lg font-bold text-slate-900">
            Booking Tidak Ditemukan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cek kembali kode booking kamu atau buat booking baru.
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            Buat Booking Baru
          </Link>
        </div>
      </div>
    );
  }

  const header = getHeader(booking);
  const statusCard = getStatusCard(booking, countdown);
  const canSubmitProof = booking.bookingStatus === "waiting_payment";
  const isFinalOrInactive = [
    "confirmed",
    "expired",
    "rejected",
    "cancelled",
  ].includes(booking.bookingStatus);

  return (
    <div className="min-h-screen bg-slate-50">
      <BookingSteps
        currentStep={5}
        steps={[
          { number: 1, label: "Pilih Olahraga", href: "/booking" },
          { number: 2, label: "Pilih Venue", href: "/booking" },
          { number: 3, label: "Pilih Jadwal", href: "/booking" },
          { number: 4, label: "Isi Data", href: "/booking" },
          { number: 5, label: "Status" },
        ]}
        title={header.title}
        subtitle={header.subtitle}
      />

      <main className="mx-auto max-w-lg px-4 -mt-6 pb-10">
        <section className={`mb-6 rounded-2xl border p-5 text-center ${statusCard.className}`}>
          <p className="text-3xl">{statusCard.icon}</p>
          <h2 className="mt-2 text-lg font-bold">{statusCard.title}</h2>
          {statusCard.countdownText && (
            <p className="mt-2 text-3xl font-extrabold">
              {statusCard.countdownText}
            </p>
          )}
          <p className="mt-2 text-sm">{statusCard.body}</p>
        </section>

        <section className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Kode Booking
            </p>
            <p className="text-3xl font-extrabold tracking-widest text-emerald-700">
              {booking.bookingCode}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {booking.bookingStatus === "confirmed"
                ? "Kode ini valid sebagai bukti booking."
                : "Simpan kode ini untuk cek status pembayaran."}
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-100 p-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Tanggal</span>
              <strong className="text-right text-slate-900">{booking.bookingDate}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Jam</span>
              <strong className="text-right text-slate-900">
                {booking.startTime} — {booking.endTime}
              </strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Durasi</span>
              <strong className="text-right text-slate-900">
                {booking.durationMinutes} menit
              </strong>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
              <span className="text-slate-500">Total</span>
              <strong className="text-right text-emerald-600">
                Rp {booking.totalPrice.toLocaleString("id-ID")}
              </strong>
            </div>
          </div>
        </section>

        {canSubmitProof && (
          <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
              <h2 className="text-sm font-bold text-white">
                💳 Instruksi Pembayaran
              </h2>
            </div>

            <div className="space-y-4 p-5">
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition ${
                        selectedMethod === method.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{method.label}</p>
                      {method.details && (
                        <p className="mt-1 text-sm text-slate-600">{method.details}</p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">
                    Silakan hubungi admin untuk instruksi pembayaran.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="proofUrl"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Link Bukti Transfer
                </label>
                <input
                  id="proofUrl"
                  type="url"
                  value={proofUrl}
                  onChange={(e) => {
                    setProofUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                />
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">⚠️ {error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={submitProof}
                disabled={submittingProof}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
              >
                {submittingProof ? "Mengirim..." : "📤 Kirim Bukti Transfer"}
              </button>

              {proofSubmitted && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
                  Bukti transfer terkirim. Menunggu verifikasi admin.
                </p>
              )}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700"
          >
            🏠 Kembali ke Beranda
          </Link>
          <Link
            href="/booking"
            className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {isFinalOrInactive ? "📅 Booking Baru" : "📅 Booking Lagi"}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-slate-500">Memuat halaman...</p>
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

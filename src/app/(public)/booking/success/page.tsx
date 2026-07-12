"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import BookingSteps from "@/components/booking/BookingSteps";
import { ReviewForm } from "@/components/reviews";
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
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
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Ignore abort errors
          return;
        }
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Hanya file gambar yang diperbolehkan.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    setProofFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function submitProof() {
    if (!booking) return;

    if (!proofFile) {
      setError("Pilih file bukti transfer.");
      return;
    }

    setSubmittingProof(true);
    setError("");

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append("file", proofFile);

      const uploadRes = await fetch("/api/uploads/proof", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadData.error ?? "Gagal mengupload file.");
      }

      const { url: proofUrl } = await uploadRes.json();

      const res = await fetch("/api/payments/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode: booking.bookingCode,
          proofUrl,
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

  // Generate WhatsApp message
  const whatsappMessage = encodeURIComponent(
    `Halo admin, saya ingin konfirmasi booking dengan kode: ${booking.bookingCode}\n\n` +
    `Detail Booking:\n` +
    `- Tanggal: ${booking.bookingDate}\n` +
    `- Jam: ${booking.startTime} - ${booking.endTime}\n` +
    `- Durasi: ${booking.durationMinutes} menit\n` +
    `- Total: Rp ${booking.totalPrice.toLocaleString("id-ID")}\n\n` +
    `Mohon konfirmasi pembayaran saya. Terima kasih!`
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <BookingSteps
        currentStep={6}
        steps={[
          { number: 1, label: "Pilih Olahraga", href: "/booking", icon: "🏆" },
          { number: 2, label: "Pilih Lapangan", href: "/booking", icon: "🏟️" },
          { number: 3, label: "Pilih Jam Main", icon: "⏰" },
          { number: 4, label: "Data Pelanggan", icon: "👤" },
          { number: 5, label: "Pembayaran", icon: "💳" },
          { number: 6, label: "Konfirmasi", icon: "✅" },
        ]}
        title={header.title}
        subtitle={header.subtitle}
      />

      <main className="page-enter page-enter-slide-up mx-auto max-w-lg px-4 pt-6 pb-10">
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
              <span className="text-slate-500">Total Pembayaran</span>
              <strong className="text-right text-lg font-extrabold text-emerald-600">
                Rp {booking.totalPrice.toLocaleString("id-ID")}
              </strong>
            </div>
          </div>

          {/* Unique Code Explanation */}
          <div className="border-t border-dashed border-amber-300 bg-amber-50 px-5 py-3 text-center">
            <p className="text-xs text-amber-700">
              💡 <strong>Nominal unik:</strong> Transfer tepat <strong>Rp {booking.totalPrice.toLocaleString("id-ID")}</strong> agar admin bisa langsung mengenali booking kamu.
            </p>
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
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Upload Bukti Transfer
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="proofFile"
                  />
                  <label
                    htmlFor="proofFile"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 transition hover:border-emerald-500 hover:bg-emerald-50"
                  >
                    {proofPreview ? (
                      <div className="text-center">
                        <img
                          src={proofPreview}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-lg object-contain"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          Klik untuk ganti gambar
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          Klik untuk upload gambar
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          PNG, JPG, JPEG (max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {error && (
                  <p className="mt-1.5 text-xs text-red-500">⚠️ {error}</p>
                )}
              </div>

              <button
                type="button"
                onClick={submitProof}
                disabled={submittingProof || !proofFile}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* WhatsApp Chat Button */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-5 py-3">
            <h2 className="text-sm font-bold text-white">
              💬 Butuh Bantuan?
            </h2>
          </div>
          <div className="p-5">
            <p className="mb-3 text-sm text-slate-600">
              Hubungi admin lapangan via WhatsApp untuk konfirmasi pembayaran atau pertanyaan lainnya.
            </p>
            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.955 11.955 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat WhatsApp Admin
            </a>
          </div>
        </section>

        {/* Review Section - only for confirmed bookings */}
        {booking.bookingStatus === "confirmed" && (
          <section className="mb-6">
            <ReviewForm
              bookingId={booking.id}
              venueId={booking.venueId}
              courtId={booking.courtId}
            />
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

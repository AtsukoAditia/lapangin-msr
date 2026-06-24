"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import BookingSteps from "@/components/booking/BookingSteps";
import type { Booking, PaymentMethod } from "@/lib/types/domain";

const POLL_INTERVAL_MS = 5000;

type BookingStatus = Booking["bookingStatus"];

interface PublicBooking {
  id: string;
  bookingCode: string;
  customerName: string;
  venueId: string;
  courtId: string;
  sportId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: Booking["paymentStatus"];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("code") ?? "";

  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [step, setStep] = useState<"instructions" | "upload" | "done">(
    "instructions",
  );
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(() => !searchParams.has("code"));
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingCode) return null;
    try {
      const res = await fetch(`/api/bookings/${bookingCode}`);
      if (res.ok) {
        const data: PublicBooking = await res.json();
        setBooking(data);
        return data;
      }
    } catch { /* ignore */ }
    return null;
  }, [bookingCode]);

  // Initial load
  useEffect(() => {
    if (!bookingCode) return;

    const controller = new AbortController();

    async function loadData() {
      try {
        const bookingRes = await fetch(`/api/bookings/${bookingCode}`, {
          signal: controller.signal,
        });
        if (bookingRes.ok) {
          setBooking(await bookingRes.json());
        }
        const methodsRes = await fetch("/api/payments/methods", {
          signal: controller.signal,
        });
        if (methodsRes.ok) {
          const data = await methodsRes.json();
          setPaymentMethods(data.methods ?? []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    loadData();

    return () => controller.abort();
  }, [bookingCode, fetchBooking]);

  // Polling for status changes (only while waiting_payment or waiting_verification)
  useEffect(() => {
    if (!booking) return;

    const pollable: BookingStatus[] = [
      "waiting_payment",
      "waiting_verification",
    ];
    if (!pollable.includes(booking.bookingStatus)) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      const fresh = await fetchBooking();
      if (fresh && !pollable.includes(fresh.bookingStatus)) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [booking?.bookingStatus, fetchBooking]);

  // Countdown timer — ponytail: refactor to useCountdown hook if reused elsewhere
  const countdownRef = useRef<number | null>(null);
  useEffect(() => {
    if (!booking?.expiresAt || booking.bookingStatus !== "waiting_payment") {
      countdownRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset countdown on deps change
      setCountdown(null);
      return;
    }

    const update = () => {
      const diff = Math.max(
        0,
        Math.floor(
          (new Date(booking.expiresAt!).getTime() - Date.now()) / 1000,
        ),
      );
      countdownRef.current = diff;
      setCountdown(diff);
      if (diff <= 0 && pollRef.current) clearInterval(pollRef.current);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [booking?.expiresAt, booking?.bookingStatus]);

  const handleSubmitProof = async () => {
    if (!booking?.id || !proofUrl.trim()) {
      setError("Masukkan link bukti transfer");
      return;
    }

    try {
      new URL(proofUrl);
    } catch {
      setError("Format URL tidak valid. Contoh: https://drive.google.com/...");
      return;
    }

    setUploading(true);
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
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengirim bukti transfer");
      }

      setStep("done");
      await fetchBooking();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal mengirim bukti transfer",
      );
    } finally {
      setUploading(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Status-specific banners ── (plain function, not component)

  function renderStatusBanner() {
    if (!booking) return null;

    const status = booking.bookingStatus;

    if (status === "expired") {
      return (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-3xl">⏰</p>
          <h3 className="mt-2 text-lg font-bold text-red-800">
            Booking Kadaluarsa
          </h3>
          <p className="mt-1 text-sm text-red-600">
            Waktu pembayaran telah habis. Silakan buat booking baru.
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-block rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            🔄 Booking Ulang
          </Link>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-3xl">❌</p>
          <h3 className="mt-2 text-lg font-bold text-red-800">
            Booking Ditolak
          </h3>
          <p className="mt-1 text-sm text-red-600">
            Pembayaran tidak dapat diverifikasi. Silakan hubungi admin.
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-block rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white"
          >
            🔄 Booking Ulang
          </Link>
        </div>
      );
    }

    if (status === "confirmed") {
      return (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <p className="text-3xl">✅</p>
          <h3 className="mt-2 text-lg font-bold text-emerald-800">
            Booking Dikonfirmasi!
          </h3>
          <p className="mt-1 text-sm text-emerald-600">
            Pembayaran sudah diverifikasi. Lapangan sudah dipesan untukmu.
          </p>
        </div>
      );
    }

    if (status === "waiting_verification") {
      return (
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
          <p className="text-3xl">🔍</p>
          <h3 className="mt-2 text-lg font-bold text-blue-800">
            Menunggu Verifikasi
          </h3>
          <p className="mt-1 text-sm text-blue-600">
            Bukti transfer sudah diterima. Admin sedang memverifikasi
            pembayaranmu. Halaman ini otomatis update.
          </p>
        </div>
      );
    }

    // waiting_payment with countdown
    if (status === "waiting_payment" && countdown !== null) {
      return (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-sm font-medium text-amber-700">
            ⏳ Sisa waktu pembayaran
          </p>
          <p
            className={`mt-1 text-3xl font-extrabold ${
              countdown < 120 ? "text-red-600" : "text-amber-700"
            }`}
          >
            {formatCountdown(countdown)}
          </p>
          {countdown < 120 && (
            <p className="mt-1 text-xs text-red-500">
              Segera selesaikan pembayaran!
            </p>
          )}
        </div>
      );
    }

    return null;
  }

  const paymentStatusDisplay = () => {
    if (!booking) return null;

    const statusConfig: Record<
      string,
      { label: string; color: string; icon: string }
    > = {
      unpaid: {
        label: "Belum Bayar",
        color: "text-amber-700 bg-amber-50 border-amber-200",
        icon: "⏳",
      },
      waiting_confirmation: {
        label: "Menunggu Konfirmasi",
        color: "text-blue-700 bg-blue-50 border-blue-200",
        icon: "🔍",
      },
      dp_paid: {
        label: "DP Terbayar",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        icon: "💰",
      },
      paid: {
        label: "Lunas",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        icon: "✅",
      },
      rejected: {
        label: "Ditolak",
        color: "text-red-700 bg-red-50 border-red-200",
        icon: "❌",
      },
      refunded: {
        label: "Refund",
        color: "text-slate-700 bg-slate-50 border-slate-200",
        icon: "↩️",
      },
    };

    const cfg = statusConfig[booking.paymentStatus];
    if (!cfg) return null;

    return (
      <div
        className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${cfg.color}`}
      >
        {cfg.icon} Status Pembayaran: <strong>{cfg.label}</strong>
      </div>
    );
  };

  // ── Loading state ──

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-slate-500">Memuat booking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingCode || !booking) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <p className="text-3xl">🔍</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">
              Booking Tidak Ditemukan
            </h3>
            <Link
              href="/booking"
              className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white"
            >
              Buat Booking Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpiredOrFinal =
    booking.bookingStatus === "expired" ||
    booking.bookingStatus === "rejected" ||
    booking.bookingStatus === "confirmed";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Step Indicator */}
      <BookingSteps
        currentStep={5}
        steps={[
          { number: 1, label: "Pilih Olahraga", href: "/booking" },
          { number: 2, label: "Pilih Venue", href: "/booking" },
          { number: 3, label: "Pilih Jadwal", href: "/booking" },
          { number: 4, label: "Isi Data", href: "/booking" },
          { number: 5, label: "Selesai" },
        ]}
        title="Booking Terkirim!"
        subtitle="Menunggu konfirmasi admin. Kamu bisa upload bukti pembayaran di bawah."
      />

      <div className="mx-auto max-w-lg px-4 -mt-6 pb-10">
        {/* Status Banner */}
        {renderStatusBanner()}

        {/* Booking Code Card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Kode Booking
            </p>
            <p className="text-3xl font-extrabold tracking-widest text-emerald-700">
              {bookingCode}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Simpan kode ini untuk referensi pembayaran
            </p>
          </div>

          {/* Booking Details */}
          <div className="border-t border-slate-100 p-5">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              📋 Detail Booking
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm">
                  📅
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Tanggal</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.bookingDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm">
                  ⏰
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Jam</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.startTime} — {booking.endTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm">
                  ⏱️
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Durasi</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.durationMinutes} menit
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    💰 Total Harga
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    Rp {booking.totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="pt-1">{paymentStatusDisplay()}</div>
            </div>
          </div>
        </div>

        {/* Payment Instructions — only for waiting_payment */}
        {step === "instructions" &&
          booking.bookingStatus === "waiting_payment" && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
                <h2 className="text-sm font-bold text-white">
                  💳 Instruksi Pembayaran
                </h2>
              </div>
              <div className="p-5">
                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full rounded-xl border-2 p-4 text-left transition ${
                          selectedMethod === method.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {method.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {method.type === "bank_transfer" &&
                                "🏦 Transfer Bank"}
                              {method.type === "e_wallet" && "📱 E-Wallet"}
                              {method.type === "qris" && "📲 QRIS"}
                              {method.type === "cash" && "💵 Tunai"}
                            </p>
                            {method.details && (
                              <p className="mt-1 text-sm text-slate-600">
                                {method.details}
                              </p>
                            )}
                          </div>
                          {selectedMethod === method.id && (
                            <span className="text-lg text-emerald-600">
                              ✓
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-700">
                      💬 Silakan hubungi admin untuk instruksi pembayaran.
                      Admin akan menghubungi via WhatsApp.
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-bold text-slate-700">
                    Langkah Pembayaran:
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        num: 1,
                        text: "Transfer sesuai nominal yang tertera",
                      },
                      { num: 2, text: "Simpan bukti transfer" },
                      {
                        num: 3,
                        text: "Klik tombol di bawah untuk upload bukti transfer",
                      },
                    ].map((item) => (
                      <div
                        key={item.num}
                        className="flex items-start gap-2.5"
                      >
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                          {item.num}
                        </span>
                        <p className="text-sm text-slate-600">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep("upload")}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700"
                >
                  📤 Saya Sudah Transfer — Kirim Bukti
                </button>
              </div>
            </div>
          )}

        {/* Upload Proof — only for waiting_payment */}
        {step === "upload" &&
          booking.bookingStatus === "waiting_payment" && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3">
                <h2 className="text-sm font-bold text-white">
                  📤 Upload Bukti Transfer
                </h2>
              </div>
              <div className="p-5">
                <div className="mb-4 rounded-xl bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    ℹ️ Upload bukti transfer ke Google Drive / Imgur / layanan
                    cloud lainnya, lalu tempel link-nya di bawah ini.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="proofUrl"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Link Bukti Transfer{" "}
                      <span className="text-red-500">*</span>
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
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                        ⚠️ {error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setStep("instructions")}
                    className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleSubmitProof}
                    disabled={uploading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50"
                  >
                    {uploading ? "Mengirim..." : "📤 Kirim Bukti"}
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Done step (after proof submitted) */}
        {step === "done" && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-center">
              <h2 className="text-sm font-bold text-white">
                ✅ Bukti Terkirim
              </h2>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">
                🎉
              </div>
              <h3 className="mb-2 text-lg font-bold text-emerald-900">
                Bukti Transfer Terkirim!
              </h3>
              <p className="text-sm text-slate-600">
                Admin akan memverifikasi pembayaran kamu. Halaman ini akan
                otomatis update saat status berubah.
              </p>
              <div className="mt-4">{paymentStatusDisplay()}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700"
          >
            🏠 Kembali ke Beranda
          </Link>
          {!isExpiredOrFinal && (
            <Link
              href="/booking"
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              📅 Booking Lagi
            </Link>
          )}
          {isExpiredOrFinal && (
            <Link
              href="/booking"
              className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              📅 Booking Baru
            </Link>
          )}
        </div>
      </div>
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
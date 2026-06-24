"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import type { Booking, PaymentMethod } from "@/lib/types/domain";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("code") ?? "—";
  const bookingId = searchParams.get("id") ?? "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [step, setStep] = useState<"instructions" | "upload" | "done">(
    "instructions",
  );

  useEffect(() => {
    if (!bookingId) return;
    const controller = new AbortController();
    fetch(`/api/bookings/${bookingId}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setBooking(data.booking ?? data);
      })
      .catch(() => {});
    fetch("/api/payments/methods", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data.methods ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [bookingId]);

  const handleSubmitProof = async () => {
    if (!bookingId || !proofUrl.trim()) {
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
        body: JSON.stringify({ bookingId, proofUrl: proofUrl.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengirim bukti transfer");
      }

      setStep("done");
      // Reload booking data
      const refreshRes = await fetch(`/api/bookings/${bookingId}`);
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json();
        setBooking(refreshed.booking ?? refreshed);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim bukti transfer");
    } finally {
      setUploading(false);
    }
  };

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
      refunded: {
        label: "Refund",
        color: "text-slate-700 bg-slate-50 border-slate-200",
        icon: "↩️",
      },
    };

    const cfg = statusConfig[booking.paymentStatus];
    if (!cfg) return null;

    return (
      <div className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${cfg.color}`}>
        {cfg.icon} Status Pembayaran: <strong>{cfg.label}</strong>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-10 sm:py-14">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl backdrop-blur-sm">
            ✅
          </div>
          <h1 className="mb-2 text-2xl font-black text-white sm:text-3xl">
            Booking Berhasil!
          </h1>
          <p className="text-sm text-emerald-100 sm:text-base">
            Terima kasih. Booking kamu sudah kami terima 🎉
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-6 pb-10">
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
          {booking && (
            <div className="border-t border-slate-100 p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-900">📋 Detail Booking</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm">📅</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Tanggal</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.bookingDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm">⏰</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Jam</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.startTime} — {booking.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm">⏱️</span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Durasi</p>
                    <p className="text-sm font-semibold text-slate-900">{booking.durationMinutes} menit</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">💰 Total Harga</span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      Rp {booking.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="pt-1">{paymentStatusDisplay()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        {step === "instructions" && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
              <h2 className="text-sm font-bold text-white">💳 Instruksi Pembayaran</h2>
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
                            {method.type === "bank_transfer" && "🏦 Transfer Bank"}
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
                          <span className="text-lg text-emerald-600">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">
                    💬 Silakan hubungi admin untuk instruksi pembayaran. Admin akan
                    menghubungi via WhatsApp.
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-bold text-slate-700">Langkah Pembayaran:</p>
                <div className="space-y-2">
                  {[
                    { num: 1, text: "Transfer sesuai nominal yang tertera" },
                    { num: 2, text: "Simpan bukti transfer" },
                    { num: 3, text: "Klik tombol di bawah untuk upload bukti transfer" },
                  ].map((item) => (
                    <div key={item.num} className="flex items-start gap-2.5">
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

        {/* Upload Proof */}
        {step === "upload" && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3">
              <h2 className="text-sm font-bold text-white">📤 Upload Bukti Transfer</h2>
            </div>
            <div className="p-5">
              <div className="mb-4 rounded-xl bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  ℹ️ Upload bukti transfer ke Google Drive / Imgur / layanan cloud
                  lainnya, lalu tempel link-nya di bawah ini.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="proofUrl"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Link Bukti Transfer <span className="text-red-500">*</span>
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

        {/* Done */}
        {step === "done" && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-center">
              <h2 className="text-sm font-bold text-white">✅ Bukti Terkirim</h2>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">
                🎉
              </div>
              <h3 className="mb-2 text-lg font-bold text-emerald-900">
                Bukti Transfer Terkirim!
              </h3>
              <p className="text-sm text-slate-600">
                Admin akan memverifikasi pembayaran kamu. Booking akan dikonfirmasi
                setelah pembayaran diverifikasi.
              </p>
              {booking && <div className="mt-4">{paymentStatusDisplay()}</div>}
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
          <Link
            href="/booking"
            className="rounded-xl border-2 border-slate-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            📅 Booking Lagi
          </Link>
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
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState, useCallback } from "react";
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

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data.booking ?? data);
      }
    } catch {
      // Silent fail for booking load
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
    fetch("/api/payments/methods")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data.methods ?? []))
      .catch(() => {});
  }, [loadBooking]);

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
      await loadBooking();
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
      <div className={`rounded-lg border px-3 py-2 text-sm ${cfg.color}`}>
        {cfg.icon} Status Pembayaran: <strong>{cfg.label}</strong>
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mb-6 text-6xl">✅</div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Booking Berhasil!
      </h1>
      <p className="mb-6 text-slate-600">
        Terima kasih. Booking kamu sudah kami terima.
      </p>

      <div className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="mb-1 text-sm text-emerald-700">Kode Booking</p>
        <p className="text-2xl font-extrabold tracking-wider text-emerald-800">
          {bookingCode}
        </p>
      </div>

      {booking && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">
            Detail Booking
          </h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p>Tanggal: {booking.bookingDate}</p>
            <p>
              Jam: {booking.startTime} — {booking.endTime}
            </p>
            <p>Durasi: {booking.durationMinutes} menit</p>
            <p className="text-lg font-bold text-emerald-700">
              Total: Rp {booking.totalPrice.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="mt-3">{paymentStatusDisplay()}</div>
        </div>
      )}

      {step === "instructions" && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">
            Instruksi Pembayaran
          </h3>

          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedMethod === method.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {method.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {method.type === "bank_transfer" && "Transfer Bank"}
                        {method.type === "e_wallet" && "E-Wallet"}
                        {method.type === "qris" && "QRIS"}
                        {method.type === "cash" && "Tunai"}
                      </p>
                      {method.details && (
                        <p className="mt-1 text-sm text-slate-600">
                          {method.details}
                        </p>
                      )}
                    </div>
                    <span className="text-lg">
                      {method.type === "bank_transfer" && "🏦"}
                      {method.type === "e_wallet" && "📱"}
                      {method.type === "qris" && "📲"}
                      {method.type === "cash" && "💵"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-700">
                Silakan hubungi admin untuk instruksi pembayaran. Admin akan
                menghubungi via WhatsApp.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            <p className="mb-1 font-medium text-slate-900">
              Langkah Pembayaran:
            </p>
            <ol className="list-inside list-decimal space-y-1">
              <li>Transfer sesuai nominal yang tertera</li>
              <li>Simpan bukti transfer</li>
              <li>Klik tombol di bawah untuk upload bukti transfer</li>
            </ol>
          </div>

          <button
            onClick={() => setStep("upload")}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
          >
            Saya Sudah Transfer — Kirim Bukti Transfer
          </button>
        </div>
      )}

      {step === "upload" && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">
            Upload Bukti Transfer
          </h3>

          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            <p>
              Upload bukti transfer ke Google Drive / Imgur / layanan cloud
              lainnya, lalu tempel link-nya di bawah ini.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="proofUrl"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Link Bukti Transfer *
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setStep("instructions")}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali
            </button>
            <button
              onClick={handleSubmitProof}
              disabled={uploading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {uploading ? "Mengirim..." : "Kirim Bukti Transfer"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm">
          <div className="mb-3 text-4xl">🎉</div>
          <h3 className="mb-2 font-semibold text-emerald-900">
            Bukti Transfer Terkirim!
          </h3>
          <p className="text-sm text-emerald-700">
            Admin akan memverifikasi pembayaran kamu. Booking akan dikonfirmasi
            setelah pembayaran diverifikasi.
          </p>
          {booking && <div className="mt-3">{paymentStatusDisplay()}</div>}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/booking"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Booking Lagi
        </Link>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-slate-500">Memuat...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get("code") ?? "—";

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

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 text-left text-sm text-slate-600 shadow-sm">
        <p className="mb-2 font-semibold text-slate-900">Langkah selanjutnya:</p>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Simpan kode booking kamu.</li>
          <li>Admin akan menghubungi via WhatsApp untuk konfirmasi.</li>
          <li>Lakukan pembayaran sesuai instruksi yang diberikan.</li>
          <li>Booking akan dikonfirmasi setelah pembayaran diverifikasi.</li>
        </ol>
      </div>

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
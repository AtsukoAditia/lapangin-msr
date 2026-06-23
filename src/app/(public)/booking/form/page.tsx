"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { getCourtById, formatPrice } from "@/lib/mock-data";

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getDurationMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courtId = searchParams.get("courtId") ?? "";
  const date = searchParams.get("date") ?? "";
  const startTime = searchParams.get("startTime") ?? "";
  const endTime = searchParams.get("endTime") ?? "";

  const court = getCourtById(courtId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  const durationMinutes =
    startTime && endTime ? getDurationMinutes(startTime, endTime) : 60;
  const totalPrice = court
    ? Math.round((durationMinutes / 60) * court.basePrice)
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsConflict(false);

    if (!court) {
      setError("Data lapangan tidak valid.");
      return;
    }
    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!phone.trim()) {
      setError("Nomor HP wajib diisi.");
      return;
    }
    if (durationMinutes <= 0) {
      setError("Durasi booking tidak valid.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim() || undefined,
          courtId,
          venueId: court.venueId,
          sportId: court.sportId,
          bookingDate: date,
          startTime,
          endTime,
          durationMinutes,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setIsConflict(true);
        }
        throw new Error(data.error ?? "Gagal membuat booking.");
      }

      const data = await res.json();
      router.push(`/booking/success?code=${data.bookingCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!court || !date || !startTime || !endTime) {
    return (
      <div className="py-12 text-center text-slate-500">
        Data booking tidak lengkap. Silakan pilih lapangan terlebih dahulu.
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Formulir Booking
      </h1>

      {/* Summary */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Lapangan</span>
          <span className="text-sm font-semibold text-slate-900">
            {court.name}
          </span>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Tanggal</span>
          <span className="text-sm font-semibold text-slate-900">{date}</span>
        </div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Jam</span>
          <span className="text-sm font-semibold text-slate-900">
            {startTime} – {endTime}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-500">Total Harga</span>
          <span className="text-lg font-bold text-emerald-700">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            {isConflict && (
              <button
                type="button"
                onClick={() =>
                  router.push(`/booking/${court.sportId}/${court.venueId}/${court.id}`)
                }
                className="mt-2 inline-block rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
              >
                Pilih Jam Lain
              </button>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nomor HP <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email{" "}
            <span className="text-xs font-normal text-slate-400">
              (opsional)
            </span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Catatan{" "}
            <span className="text-xs font-normal text-slate-400">
              (opsional)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Misal: butuh 2 bola, ada acara khusus, dll."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Mengirim..." : "Kirim Booking"}
        </button>
      </form>
    </main>
  );
}

export default function BookingFormPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-slate-500">Memuat...</div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}

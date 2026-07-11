"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { formatPrice } from "@/lib/mock-data";
import BookingSteps from "@/components/booking/BookingSteps";
import type { Court } from "@/lib/types/domain";

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

  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourt() {
      if (!courtId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/courts`);
        const data = await res.json().catch(() => ({}));
        const courts = data.courts ?? data.data ?? [];
        const found = courts.find((c: Court) => c.id === courtId) ?? null;
        setCourt(found);
      } catch {
        setCourt(null);
      } finally {
        setLoading(false);
      }
    }
    loadCourt();
  }, [courtId]);

  const [pricingInfo, setPricingInfo] = useState<{
    basePricePerHour: number;
    baseTotal: number;
    finalTotal: number;
    finalMultiplier: number;
    savings: number;
    multipliers: { name: string; factor: number; reason: string }[];
  } | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Fetch dynamic pricing when all params available
  useEffect(() => {
    if (!courtId || !date || !startTime || !endTime) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state before async fetch
    setPricingLoading(true);
    fetch(`/api/pricing/calculate?courtId=${courtId}&date=${date}&startTime=${startTime}&endTime=${endTime}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.finalTotal) {
          setPricingInfo(data);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPricingLoading(false); });
    return () => { cancelled = true; };
  }, [courtId, date, startTime, endTime]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);

  const durationMinutes =
    startTime && endTime ? getDurationMinutes(startTime, endTime) : 60;

  // Fallback total from court base price
  const fallbackTotal = court
    ? Math.round((durationMinutes / 60) * court.basePrice)
    : 0;
  const totalPrice = pricingInfo?.finalTotal ?? fallbackTotal;

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm text-slate-500">Memuat data lapangan...</p>
      </div>
    );
  }

  if (!court || !date || !startTime || !endTime) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 text-5xl">📋</div>
        <p className="text-lg font-semibold text-slate-700">
          Data booking tidak lengkap
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Silakan pilih lapangan terlebih dahulu.
        </p>
        <button
          onClick={() => router.push("/booking")}
          className="mt-4 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          ← Pilih Lapangan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with step indicator */}
      <BookingSteps
        currentStep={4}
        title="📝 Isi Data Booking"
        subtitle="Lengkapi data diri Anda untuk melanjutkan pemesanan"
      />

      <div className="page-enter page-enter-slide-up mx-auto max-w-2xl px-4 py-6">
        {/* Booking Summary Card */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3">
            <h2 className="text-sm font-bold text-white">📋 Ringkasan Booking</h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm">🏟️</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Lapangan</p>
                  <p className="text-sm font-semibold text-slate-900">{court.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm">📅</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Tanggal</p>
                  <p className="text-sm font-semibold text-slate-900">{date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm">⏰</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Jam</p>
                  <p className="text-sm font-semibold text-slate-900">{startTime} – {endTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm">⏱️</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Durasi</p>
                  <p className="text-sm font-semibold text-slate-900">{durationMinutes} menit</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">💰 Total Harga</span>
                  <div className="text-right">
                    {pricingInfo && pricingInfo.finalMultiplier !== 1 && (
                      <p className="text-xs text-slate-400 line-through">{formatPrice(pricingInfo.baseTotal)}</p>
                    )}
                    <span className={`text-xl font-extrabold ${pricingInfo && pricingInfo.savings < 0 ? 'text-amber-600' : pricingInfo && pricingInfo.savings > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {pricingLoading ? '...' : formatPrice(totalPrice)}
                    </span>
                    {pricingInfo && pricingInfo.multipliers.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {pricingInfo.multipliers.map((m, i) => (
                          <p key={i} className="text-[10px] text-slate-500">
                            {m.factor > 1 ? '📈' : '📉'} {m.reason}
                          </p>
                        ))}
                      </div>
                    )}
                    {pricingInfo && pricingInfo.savings > 0 && (
                      <p className="text-xs font-medium text-blue-600">Hemat {formatPrice(pricingInfo.savings)}</p>
                    )}
                    {pricingInfo && pricingInfo.savings < 0 && (
                      <p className="text-xs font-medium text-amber-600">+{formatPrice(Math.abs(pricingInfo.savings))} surcharge</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-3">
              <h2 className="text-sm font-bold text-white">👤 Data Diri</h2>
            </div>
            <div className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">⚠️ {error}</p>
                  {isConflict && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/booking/${court.sportId}/${court.venueId}/${court.id}`)
                      }
                      className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    >
                      🔄 Pilih Jam Lain
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🇮🇩 +62</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="8123456789"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-16 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Catatan <span className="text-xs font-normal text-slate-400">(opsional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Misal: butuh 2 bola, ada acara khusus, dll."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "✅ Konfirmasi Booking"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              Dengan mengklik, kamu menyetujui syarat & ketentuan booking.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookingFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <p className="text-sm text-slate-500">Memuat formulir...</p>
          </div>
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
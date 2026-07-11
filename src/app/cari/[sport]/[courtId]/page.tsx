"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface PricingRule {
  id: string;
  courtId: string;
  dayType: string;
  startTime: string;
  endTime: string;
  pricePerHour: number;
  priority: number;
  isActive: boolean;
}

interface CourtDetail {
  court: { id: string; name: string; slug: string; surfaceType: string; indoorType: string; capacity: number; basePrice: number; sportId: string; sportName: string; sportSlug: string };
  venue: { id: string; name: string; slug: string; address: string; phone: string; mapsUrl: string; openTime: string; closeTime: string };
  area: { label: string; city: string; province: string } | null;
  pricing: PricingRule[];
  siblingCourts: Array<{ id: string; name: string; slug: string; indoorType: string; surfaceType: string; basePrice: number }>;
  bookingsByDate: Record<string, Array<{ startTime: string; endTime: string; bookingStatus: string }>>;
  rating?: { avgRating: number; reviewCount: number };
  reviews?: Array<{ id: string; rating: number; comment: string; customerName?: string; createdAt: string }>;
}

function fmt(n: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n); }

function StarRating({ rating, count, size = "md" }: { rating: number; count: number; size?: "sm" | "md" | "lg" }) {
  if (count === 0) return <p className="text-sm text-slate-400">Belum ada rating</p>;
  const stars = Math.round(rating);
  const sz = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`${sz} ${s <= stars ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
      <span className="text-slate-400">({count} ulasan)</span>
    </div>
  );
}

function generateSlots(openTime: string, closeTime: string) {
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  const openMin = oh * 60 + om;
  const closeMin = ch * 60 + cm;
  const slots: string[] = [];
  for (let m = openMin; m < closeMin; m += 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return slots;
}

export default function CourtDetailPage({ params }: { params: Promise<{ sport: string; courtId: string }> }) {
  const { sport: sportSlug, courtId } = use(params);
  const [data, setData] = useState<CourtDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetch(`/api/search/courts/${courtId}`)
      .then(r => r.json())
      .then(d => { if (d.court) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courtId]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-pulse text-lg text-slate-400">Memuat...</div></div>;
  if (!data) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-5xl mb-4">😢</p><p className="text-slate-500">Lapangan tidak ditemukan</p></div>;

  const { court, venue, area, pricing, siblingCourts, bookingsByDate } = data;
  const slots = generateSlots(venue.openTime, venue.closeTime);
  const dayBookings = bookingsByDate[selectedDate] || [];

  // Check if a slot is booked
  const isBooked = (slot: string) => {
    const slotMin = parseInt(slot.split(":")[0]) * 60 + parseInt(slot.split(":")[1]);
    return dayBookings.some(b => {
      const [bsH, bsM] = b.startTime.split(":").map(Number);
      const [beH, beM] = b.endTime.split(":").map(Number);
      const bStart = bsH * 60 + bsM;
      const bEnd = beH * 60 + beM;
      return slotMin >= bStart && slotMin < bEnd;
    });
  };

  const bookedSlot = (slot: string) => dayBookings.find(b => {
    const slotMin = parseInt(slot.split(":")[0]) * 60 + parseInt(slot.split(":")[1]);
    const [bsH, bsM] = b.startTime.split(":").map(Number);
    const [beH, beM] = b.endTime.split(":").map(Number);
    const bStart = bsH * 60 + bsM;
    const bEnd = beH * 60 + beM;
    return slotMin >= bStart && slotMin < bEnd;
  });

  // Dates for selector (next 7 days)
  const dates: Array<{ value: string; label: string; day: string }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    dates.push({
      value: d.toISOString().split("T")[0],
      label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
      day: d.toLocaleDateString("id-ID", { weekday: "long" }),
    });
  }

  const sportEmojiMap: Record<string, string> = { futsal: "⚽", "minisoccer": "🥅", "mini-soccer": "🥅", badminton: "🏸", "bulu-tangkis": "🏸", padel: "🎾", tenis: "🎾", basket: "🏀" };
  const emoji = sportEmojiMap[sportSlug] || "🏟️";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          <nav className="flex items-center gap-1.5 text-sm text-emerald-100 mb-4 flex-wrap">
            <Link href="/" className="hover:text-white">Beranda</Link>
            <span>/</span>
            <Link href={`/cari/${sportSlug}`} className="hover:text-white">{court.sportName}</Link>
            <span>/</span>
            <span className="text-white font-medium">{court.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{emoji}</span>
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">{court.name}</h1>
              <p className="text-emerald-100 text-sm">{venue.name}{area ? ` · ${area.city}, ${area.province}` : ""}</p>
              {data.rating && data.rating.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`h-4 w-4 ${s <= Math.round(data.rating!.avgRating) ? "text-amber-300" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-white">{data.rating.avgRating.toFixed(1)}</span>
                  <span className="text-sm text-emerald-200">({data.rating.reviewCount} ulasan)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6 pb-28 sm:pb-6">
        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Court Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Informasi Lapangan</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Tipe</dt><dd className="font-medium text-slate-900">{court.indoorType === "indoor" ? "🏠 Indoor" : court.indoorType === "outdoor" ? "☀️ Outdoor" : "🏕️ Semi Outdoor"}</dd></div>
              {court.surfaceType && <div className="flex justify-between"><dt className="text-slate-500">Lantai</dt><dd className="font-medium text-slate-900">{court.surfaceType}</dd></div>}
              {court.capacity > 0 && <div className="flex justify-between"><dt className="text-slate-500">Kapasitas</dt><dd className="font-medium text-slate-900">{court.capacity} orang</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-500">Jam Operasional</dt><dd className="font-medium text-slate-900">{venue.openTime?.slice(0, 5)} – {venue.closeTime?.slice(0, 5)}</dd></div>
            </dl>
          </div>

          {/* Venue Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3">Informasi Venue</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Venue</dt><dd className="font-medium text-slate-900">{venue.name}</dd></div>
              {venue.address && <div className="flex justify-between"><dt className="text-slate-500">Alamat</dt><dd className="font-medium text-slate-900 text-right max-w-[60%]">{venue.address}</dd></div>}
              {venue.phone && <div className="flex justify-between"><dt className="text-slate-500">Telepon</dt><dd className="font-medium text-slate-900">{venue.phone}</dd></div>}
              {venue.mapsUrl && <div><a href={venue.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm">📍 Lihat di Maps →</a></div>}
            </dl>
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">💰 Daftar Harga</h2>
          {pricing.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pricing.map(rule => (
                <div key={rule.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <span className="text-sm text-slate-700 font-medium">
                      {rule.dayType === "weekday" ? "📅 Weekday" : rule.dayType === "weekend" ? "🎉 Weekend" : rule.dayType === "holiday" ? "🏖️ Hari Libur" : "📆 Semua Hari"}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{rule.startTime?.slice(0, 5)} – {rule.endTime?.slice(0, 5)}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">{fmt(rule.pricePerHour)}/jam</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Harga dasar</span>
              <span className="text-lg font-bold text-emerald-700">{fmt(court.basePrice)}/jam</span>
            </div>
          )}
        </div>

        {/* Reviews */}
        {data.reviews && data.reviews.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">⭐ Ulasan Pelanggan</h2>
              {data.rating && data.rating.reviewCount > 0 && (
                <StarRating rating={data.rating.avgRating} count={data.rating.reviewCount} size="sm" />
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {data.reviews.map((r) => (
                <div key={r.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {r.customerName && <span className="text-xs font-medium text-slate-600">{r.customerName}</span>}
                    <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Placeholder */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">📸 Foto Lapangan</h2>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center border border-slate-100">
                <span className="text-3xl opacity-30">{emoji}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">Foto akan segera tersedia</p>
        </div>

        {/* Date & Slot Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">📅 Pilih Tanggal & Jam</h2>

          {/* Date selector */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {dates.map(d => (
              <button
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedDate === d.value
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-4 rounded bg-emerald-100 border-2 border-emerald-400" /> Tersedia</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-4 rounded bg-red-100 border-2 border-red-300" /> Terbooking</span>
          </div>

          {/* Booking Button - Above Slots */}
          <Link
            href={`/booking/${sportSlug}/${venue.slug}/${court.slug}`}
            className="hidden sm:inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition mb-4"
          >
            🏟️ Booking Sekarang
          </Link>

          {/* Slots */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {slots.map(slot => {
              const booked = isBooked(slot);
              const booking = bookedSlot(slot);
              return (
                <div
                  key={slot}
                  className={`rounded-xl px-3 py-3 text-center text-sm font-medium transition-all ${
                    booked
                      ? "bg-red-50 border-2 border-red-200 text-red-600"
                      : "bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                  }`}
                >
                  <div className="font-bold">{slot}</div>
                  {booked && booking && (
                    <div className="text-xs text-red-400 mt-0.5">Terbooking</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sibling Courts */}
        {siblingCourts.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3">🏟️ Lapangan Lain di {venue.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {siblingCourts.map(sc => (
                <Link
                  key={sc.id}
                  href={`/cari/${sportSlug}/${sc.id}`}
                  className="rounded-xl border border-slate-200 p-3 hover:border-emerald-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{sc.name}</span>
                    <span className="text-xs text-slate-500">{sc.indoorType}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">{fmt(sc.basePrice)}/jam</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-center text-white">
          <h3 className="text-lg font-bold mb-2">Tertarik booking?</h3>
          <p className="text-emerald-100 text-sm mb-4">Pilih jam yang tersedia di atas, lalu lanjutkan ke form booking</p>
          <Link
            href={`/booking/${sportSlug}/${venue.slug}/${court.slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-emerald-700 shadow-lg hover:bg-yellow-300 hover:text-emerald-800 transition-all hover:scale-105"
          >
            🏟️ Booking Sekarang
          </Link>
        </div>
      </main>

      {/* Floating Booking Button - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 p-4 sm:hidden">
        <Link
          href={`/booking/${sportSlug}/${venue.slug}/${court.slug}`}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3.5 text-base font-bold text-white shadow-md hover:bg-emerald-700 transition"
        >
          🏟️ Booking Sekarang
        </Link>
      </div>
    </div>
  );
}

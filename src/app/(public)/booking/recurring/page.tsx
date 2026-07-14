"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Court { courtId: string; courtName: string; venueId: string; venueName: string; minPrice: number; maxPrice: number; }
interface Sport { id: string; name: string; }
interface Area { id: string; city: string; province: string; }
interface PreviewDate { date: string; dayName: string; }

const RECURRENCE_LABELS: Record<string, string> = {
  weekly: "Mingguan",
  biweekly: "Dua Mingguan",
  monthly: "Bulanan",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getDayName(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short" });
}

function generateDates(startDate: string, type: string, count: number): PreviewDate[] {
  const dates: PreviewDate[] = [];
  let current = new Date(startDate + "T00:00:00");
  const step = type === "weekly" ? 7 : type === "biweekly" ? 14 : 0; // monthly handled separately
  for (let i = 0; i < count; i++) {
    if (type === "monthly") {
      current.setMonth(current.getMonth() + 1);
    } else {
      current.setDate(current.getDate() + step);
    }
    const iso = current.toISOString().split("T")[0];
    dates.push({ date: iso, dayName: getDayName(iso) });
  }
  return dates;
}

export default function RecurringBookingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [sports, setSports] = useState<Sport[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [sportId, setSportId] = useState(params.get("sport") || "");
  const [areaId, setAreaId] = useState("");
  const [courtId, setCourtId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurrenceType, setRecurrenceType] = useState("weekly");
  const [weeks, setWeeks] = useState(4);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const maxCount = recurrenceType === "monthly" ? 6 : 12;
  const previewDates = bookingDate && recurrenceType
    ? generateDates(bookingDate, recurrenceType, Math.min(weeks, maxCount))
    : [];

  useEffect(() => {
    Promise.all([
      fetch("/api/sports").then((r) => r.json()),
      fetch("/api/areas").then((r) => r.json()),
    ]).then(([s, a]) => {
      if (s.sports) setSports(s.sports);
      if (a.data) setAreas(a.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!sportId || !areaId) { setCourts([]); return; }
    fetch(`/api/search/courts?sport=${sportId}&area=${areaId}`)
      .then((r) => r.json())
      .then((d) => { if (d.courts) setCourts(d.courts); });
  }, [sportId, areaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId || !bookingDate || !customerName || !customerPhone) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, customerPhone, customerEmail,
          venueId: courts.find((c) => c.courtId === courtId)?.venueId || "",
          courtId, sportId,
          startDate: bookingDate, startTime, endTime,
          recurrenceType, weeks,
          notes,
        }),
      });
      const data = await res.json();
      if (data.bookings) {
        setSuccess(`Berhasil membuat ${data.bookings.length} booking berulang! Kode pertama: ${data.bookings[0]?.bookingCode}`);
      } else {
        alert(data.error || "Gagal membuat booking");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Booking Berulang Berhasil!</h2>
          <p className="text-gray-600 mb-6">{success}</p>
          <Link href="/profile/bookings" className="block w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
            Lihat Booking Saya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <Link href="/booking" className="text-emerald-600 text-sm hover:underline">← Kembali</Link>
          <h1 className="text-lg font-bold mt-1">🔄 Booking Berulang</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Step 1: Basic Info */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="font-semibold mb-4">1. Pilih Lapangan</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Olahraga</label>
              <select value={sportId} onChange={(e) => { setSportId(e.target.value); setCourtId(""); }} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Olahraga</option>
                {sports.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <select value={areaId} onChange={(e) => { setAreaId(e.target.value); setCourtId(""); }} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">Pilih Area</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.city}, {a.province}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lapangan</label>
            <select value={courtId} onChange={(e) => setCourtId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih Lapangan</option>
              {courts.map((c) => <option key={c.courtId} value={c.courtId}>{c.venueName} — {c.courtName} (Rp {c.minPrice.toLocaleString()})</option>)}
            </select>
          </div>
        </div>

        {/* Step 2: Time */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="font-semibold mb-4">2. Jadwal</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Step 3: Recurrence */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="font-semibold mb-4">3. Pengulangan</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
              <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                {Object.entries(RECURRENCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah {recurrenceType === "monthly" ? "Bulan" : "Minggu"}</label>
              <input type="number" min={1} max={maxCount} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          {previewDates.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview ({previewDates.length} kali):</p>
              <div className="flex flex-wrap gap-2">
                {previewDates.map((d) => (
                  <span key={d.date} className="text-xs bg-white border rounded px-2 py-1">
                    {d.dayName} {d.date.slice(8, 10)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Contact */}
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <h2 className="font-semibold mb-4">4. Data Pemesan</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (opsional)</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="Opsional" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !courtId || !bookingDate || !customerName || !customerPhone}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Membuat Booking..." : `Booking Berulang (${previewDates.length} kali)`}
        </button>
      </form>
    </div>
  );
}

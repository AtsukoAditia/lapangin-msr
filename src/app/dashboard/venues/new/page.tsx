"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SPORTS_OPTIONS = [
  { id: "futsal", label: "Futsal" },
  { id: "badminton", label: "Badminton" },
  { id: "tennis", label: "Tennis" },
  { id: "basketball", label: "Basketball" },
  { id: "volleyball", label: "Volleyball" },
  { id: "billiard", label: "Billiard" },
  { id: "pingpong", label: "Ping Pong" },
  { id: "swimming", label: "Renang" },
];

const FACILITY_OPTIONS = [
  "Parkir Luas",
  "Ruang Ganti",
  "Shower",
  "Kantin",
  "WiFi",
  "CCTV",
  "Sound System",
  "AC/Indoor",
  "Mushola",
  "Toilet",
  "Laundry Ball",
  "Tribun Penonton",
];

interface VenueForm {
  name: string;
  description: string;
  address: string;
  phone: string;
  mapsUrl: string;
  sports: string[];
  facilities: string[];
  openTime: string;
  closeTime: string;
}

const EMPTY_FORM: VenueForm = {
  name: "",
  description: "",
  address: "",
  phone: "",
  mapsUrl: "",
  sports: [],
  facilities: [],
  openTime: "06:00",
  closeTime: "23:00",
};

export default function NewVenuePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<VenueForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof VenueForm>(key: K, val: VenueForm[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleArray(key: "sports" | "facilities", val: string) {
    setForm((prev) => {
      const arr = prev[key].includes(val) ? prev[key].filter((v) => v !== val) : [...prev[key], val];
      return { ...prev, [key]: arr };
    });
  }

  async function handleSubmit() {
    if (!form.name || !form.address) {
      setError("Nama dan alamat wajib diisi");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/owner/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          address: form.address,
          phone: form.phone,
          mapsUrl: form.mapsUrl,
          facilities: form.facilities,
          openTime: form.openTime,
          closeTime: form.closeTime,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal membuat venue");
        return;
      }
      router.push("/dashboard/venues");
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  const canNext = step === 1 ? !!form.name && !!form.address : step === 2 ? form.sports.length > 0 : true;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Tambah Venue</h1>
        <p className="text-gray-500 text-sm mt-1">Daftarkan venue baru Anda</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                step >= s ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s ? "✓" : s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 flex-1 rounded ${step > s ? "bg-emerald-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Informasi Dasar</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Venue *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Contoh: Lapangan Futsal ABC"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Deskripsi singkat venue Anda..."
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Jl. Contoh No. 123, Kota"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="08123456789"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
                <input
                  type="url"
                  value={form.mapsUrl}
                  onChange={(e) => update("mapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Sports & Facilities */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Olahraga yang Tersedia *</h2>
              <p className="text-sm text-gray-500">Pilih minimal satu jenis olahraga</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {SPORTS_OPTIONS.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.sports.includes(s.id)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.sports.includes(s.id)}
                      onChange={() => toggleArray("sports", s.id)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Fasilitas</h2>
              <p className="text-sm text-gray-500">Fasilitas yang tersedia di venue</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {FACILITY_OPTIONS.map((f) => (
                  <label
                    key={f}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.facilities.includes(f)
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.facilities.includes(f)}
                      onChange={() => toggleArray("facilities", f)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Operating Hours + Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Jam Operasional</h2>
              <p className="text-sm text-gray-500">Jam buka dan tutup venue</p>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Buka</label>
                  <input
                    type="time"
                    value={form.openTime}
                    onChange={(e) => update("openTime", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Tutup</label>
                  <input
                    type="time"
                    value={form.closeTime}
                    onChange={(e) => update("closeTime", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Preview</h2>
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{form.name || "(Tanpa Nama)"}</h3>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Menunggu Review</span>
                </div>
                {form.description && <p className="text-sm text-gray-600">{form.description}</p>}
                <p className="text-sm text-gray-500">📍 {form.address || "(Belum diisi)"}</p>
                {form.phone && <p className="text-sm text-gray-500">📞 {form.phone}</p>}
                <p className="text-sm text-gray-500">⏰ {form.openTime} – {form.closeTime}</p>
                {form.sports.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.sports.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                        {SPORTS_OPTIONS.find((o) => o.id === s)?.label ?? s}
                      </span>
                    ))}
                  </div>
                )}
                {form.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.facilities.map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-md">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Kembali
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Mengirim..." : "Kirim untuk Review"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

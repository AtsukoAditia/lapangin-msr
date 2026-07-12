"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RainLevel {
  discountPercent: number;
  minMm: number;
  maxMm: number;
  label: string;
  description: string;
  example: string;
}

interface RainDiscountConfig {
  enabled: boolean;
  levels: {
    light: RainLevel;
    moderate: RainLevel;
    heavy: RainLevel;
  };
}

const DEFAULT_CONFIG: RainDiscountConfig = {
  enabled: false,
  levels: {
    light: {
      discountPercent: 10,
      minMm: 1,
      maxMm: 5,
      label: "Hujan Ringan",
      description: "Gerimis atau hujan ringan yang tidak terlalu mengganggu aktivitas outdoor.",
      example: "Contoh: gerimis, hujan sebentar lalu berhenti",
    },
    moderate: {
      discountPercent: 20,
      minMm: 5,
      maxMm: 15,
      label: "Hujan Sedang",
      description: "Hujan cukup deras tapi masih memungkinkan bermain di lapangan beratap/tenda.",
      example: "Contoh: hujan terus-menerus tapi tidak banjir",
    },
    heavy: {
      discountPercent: 30,
      minMm: 15,
      maxMm: 999,
      label: "Hujan Deras",
      description: "Hujan sangat deras, kemungkinan besar lapangan tergenang atau tidak bisa dipakai.",
      example: "Contoh: hujan badai, petir, banjir",
    },
  },
};

const EDUCATION = {
  what: "Diskon cuaca adalah fitur yang memberikan potongan harga otomatis kepada pelanggan saat booking lapangan outdoor di hari dengan prediksi hujan. Ini meningkatkan kepercayaan pelanggan dan mengurangi pembatalan mendadak.",
  why: [
    "🏟️ Lapangan outdoor lebih rentan terhadap cuaca — pelanggan sering ragu booking saat prediksi hujan",
    "💰 Diskon kecil (10-30%) jauh lebih murah daripada lapangan kosong total",
    "📊 Data menunjukkan venue dengan diskon cuaca punya 40% lebih banyak booking saat musim hujan",
    "⭐ Meningkatkan review positif — pelanggan merasa diperlakukan adil",
    "🔄 Mengurangi no-show dan pembatalan last-minute",
  ],
  how: "Sistem akan otomatis mengecek prediksi cuaca (dari WeatherAPI.com) saat pelanggan booking lapangan outdoor. Jika prediksi hujan, sistem otomatis menerapkan diskon sesuai persentase yang Anda atur. Diskon hanya berlaku untuk lapangan outdoor — lapangan indoor tidak terpengaruh.",
  tips: [
    "💡 Mulai dengan diskon kecil (5-10%) untuk hujan ringan — ini sudah cukup menarik bagi pelanggan",
    "💡 Diskon 20-30% untuk hujan deras wajar karena risiko lapangan tidak bisa dipakai",
    "💡 Jangan setting diskon terlalu tinggi (>40%) karena bisa merugikan bisnis",
    "💡 Fitur ini bekerja otomatis — Anda tidak perlu cek cuaca manual setiap hari",
  ],
};

export default function OwnerRainDiscountPage() {
  const [config, setConfig] = useState<RainDiscountConfig>(DEFAULT_CONFIG);
  const [venues, setVenues] = useState<{ venueId: string; venueName: string }[]>([]);
  const [selectedVenue, setSelectedVenue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  useEffect(() => {
    fetch("/api/owner/venues/rain-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.configs) {
          setVenues(data.configs.map((c: { venueId: string; venueName: string }) => ({ venueId: c.venueId, venueName: c.venueName })));
          if (data.configs.length > 0) {
            setSelectedVenue(data.configs[0].venueId);
            const existing = data.configs[0].rainDiscountConfig;
            if (existing?.enabled !== undefined) {
              setConfig({ ...DEFAULT_CONFIG, ...existing, levels: { ...DEFAULT_CONFIG.levels, ...existing.levels } });
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  function handleVenueChange(venueId: string) {
    setSelectedVenue(venueId);
    fetch("/api/owner/venues/rain-config")
      .then((r) => r.json())
      .then((data) => {
        const vc = data.configs?.find((c: { venueId: string }) => c.venueId === venueId);
        if (vc?.rainDiscountConfig?.enabled !== undefined) {
          setConfig({ ...DEFAULT_CONFIG, ...vc.rainDiscountConfig, levels: { ...DEFAULT_CONFIG.levels, ...vc.rainDiscountConfig.levels } });
        } else {
          setConfig(DEFAULT_CONFIG);
        }
      })
      .catch(() => {});
    setSaved(false);
  }

  function handleLevelChange(level: "light" | "moderate" | "heavy", field: string, value: number) {
    setConfig((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [level]: { ...prev.levels[level], [field]: value },
      },
    }));
    setSaved(false);
  }

  async function handleSave() {
    if (!selectedVenue) return;
    setSaving(true);
    try {
      const res = await fetch("/api/owner/venues/rain-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: selectedVenue, config }),
      });
      if (res.ok) setSaved(true);
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const samplePrice = 150000;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
            <h1 className="text-lg font-black text-gray-900">🌧️ Diskon Cuaca</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !selectedVenue}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : saved ? "✅ Tersimpan" : "💾 Simpan"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Venue Selector */}
        {venues.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Venue</label>
            <select
              value={selectedVenue}
              onChange={(e) => handleVenueChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {venues.map((v) => (
                <option key={v.venueId} value={v.venueId}>{v.venueName}</option>
              ))}
            </select>
          </div>
        )}

        {/* Toggle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Aktifkan Diskon Cuaca</h2>
              <p className="text-sm text-gray-500 mt-1">Berikan diskon otomatis saat hujan untuk lapangan outdoor</p>
            </div>
            <button
              onClick={() => { setConfig((prev) => ({ ...prev, enabled: !prev.enabled })); setSaved(false); }}
              className={`relative w-14 h-8 rounded-full transition-colors ${config.enabled ? "bg-emerald-500" : "bg-gray-300"}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.enabled ? "left-7" : "left-1"}`} />
            </button>
          </div>
          {config.enabled && (
            <p className="text-xs text-emerald-600 mt-2">✅ Aktif — pelanggan akan mendapat diskon otomatis saat booking lapangan outdoor di hari hujan</p>
          )}
        </div>

        {/* Education Toggle */}
        <button
          onClick={() => setShowEducation(!showEducation)}
          className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <span className="font-bold text-blue-900">Pelajari tentang Diskon Cuaca</span>
            </div>
            <span className="text-blue-500">{showEducation ? "▲" : "▼"}</span>
          </div>
        </button>

        {showEducation && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">🤔 Apa itu Diskon Cuaca?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{EDUCATION.what}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">💡 Kenapa Perlu?</h3>
              <ul className="space-y-2">
                {EDUCATION.why.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">⚙️ Cara Kerja</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{EDUCATION.how}</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📝 Tips Pengaturan</h3>
              <ul className="space-y-1">
                {EDUCATION.tips.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Rain Level Settings */}
        {config.enabled && (
          <div className="space-y-4">
            {(["light", "moderate", "heavy"] as const).map((level) => {
              const l = config.levels[level];
              const discountedPrice = Math.round(samplePrice * (1 - l.discountPercent / 100));
              return (
                <div key={level} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{level === "light" ? "🌦️" : level === "moderate" ? "🌧️" : "⛈️"}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{l.label}</h3>
                      <p className="text-xs text-gray-500">{l.minMm}–{l.maxMm >= 999 ? "999+" : l.maxMm} mm curah hujan</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{l.description}</p>
                  <p className="text-xs text-gray-400 italic mb-4">{l.example}</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diskon (%)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={50}
                        step={5}
                        value={l.discountPercent}
                        onChange={(e) => handleLevelChange(level, "discountPercent", Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="w-20 text-center">
                        <span className="text-2xl font-black text-emerald-600">{l.discountPercent}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Preview untuk pelanggan:</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm line-through text-gray-400">Rp {samplePrice.toLocaleString("id-ID")}</span>
                      <span className="text-sm font-bold text-green-600">Rp {discountedPrice.toLocaleString("id-ID")}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">HEMAT Rp {(samplePrice - discountedPrice).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {config.enabled && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-900 mb-2">📊 Ringkasan Konfigurasi</h3>
            <ul className="space-y-1 text-sm text-emerald-700">
              <li>• Hujan ringan ({config.levels.light.minMm}-{config.levels.light.maxMm}mm): diskon {config.levels.light.discountPercent}%</li>
              <li>• Hujan sedang ({config.levels.moderate.minMm}-{config.levels.moderate.maxMm}mm): diskon {config.levels.moderate.discountPercent}%</li>
              <li>• Hujan deras ({config.levels.heavy.minMm}mm+): diskon {config.levels.heavy.discountPercent}%</li>
            </ul>
            <p className="text-xs text-emerald-600 mt-3">⚠️ Diskon hanya berlaku untuk lapangan outdoor. Lapangan indoor tidak terpengaruh.</p>
          </div>
        )}
      </main>
    </div>
  );
}

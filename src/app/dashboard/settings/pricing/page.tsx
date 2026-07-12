"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Court {
  id: string;
  name: string;
  venueId: string;
  basePrice: number;
}

interface PricingRule {
  id: string;
  courtId: string;
  dayType: "weekday" | "weekend" | "holiday" | "all";
  startTime: string;
  endTime: string;
  pricePerHour: number;
  priority: number;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
  type: "national" | "religious" | "joint_leave";
}

interface Venue {
  id: string;
  name: string;
}

export default function OwnerPricingPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourt, setEditingCourt] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    dayType: "weekday",
    startTime: "06:00",
    endTime: "23:00",
    pricePerHour: 100000,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/owner/pricing");
      const data = await res.json();
      setVenues(data.venues || []);
      setCourts(data.courts || []);
      setRules(data.pricingRules || []);
      setHolidays(data.holidays || []);
    } catch (error) {
      console.error("Failed to fetch pricing data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRule(courtId: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/owner/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courtId, ...newRule }),
      });
      if (res.ok) {
        await fetchData();
        setEditingCourt(null);
        setNewRule({ dayType: "weekday", startTime: "06:00", endTime: "23:00", pricePerHour: 100000 });
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menambahkan aturan harga");
      }
    } catch (error) {
      console.error("Failed to add rule:", error);
      alert("Gagal menambahkan aturan harga");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm("Yakin ingin menghapus aturan harga ini?")) return;
    try {
      const res = await fetch(`/api/owner/pricing?id=${ruleId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      } else {
        alert("Gagal menghapus aturan harga");
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
      alert("Gagal menghapus aturan harga");
    }
  }

  async function handleUpdateRule(ruleId: string, updates: Partial<PricingRule>) {
    try {
      const res = await fetch("/api/owner/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ruleId, ...updates }),
      });
      if (res.ok) {
        await fetchData();
      } else {
        alert("Gagal mengupdate aturan harga");
      }
    } catch (error) {
      console.error("Failed to update rule:", error);
      alert("Gagal mengupdate aturan harga");
    }
  }

  function getCourtRules(courtId: string) {
    return rules.filter((r) => r.courtId === courtId).sort((a, b) => a.priority - b.priority);
  }

  function getVenueName(venueId: string) {
    return venues.find((v) => v.id === venueId)?.name || "Unknown Venue";
  }

  function formatRupiah(amount: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Memuat data harga...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
            <h1 className="text-lg font-black text-gray-900">💰 Kelola Harga Lapangan</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Education Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">📚 Tentang Sistem Harga</h2>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Weekday:</strong> Senin - Jumat (hari kerja normal)</p>
            <p><strong>Weekend:</strong> Sabtu - Minggu</p>
            <p><strong>Holiday (Tanggal Merah):</strong> Hari libur nasional dan cuti bersama (lihat daftar di bawah)</p>
            <p className="mt-3"><strong>💡 Tips:</strong> Anda bisa mengatur harga berbeda untuk jam sibuk (peak hours) dan jam sepi. Sistem akan otomatis menggunakan harga yang sesuai dengan hari dan jam booking.</p>
          </div>
        </div>

        {/* Upcoming Holidays */}
        {upcomingHolidays.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🗓️ Tanggal Merah Mendatang</h2>
            <div className="space-y-2">
              {upcomingHolidays.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-600 font-bold text-sm min-w-[120px]">{formatDate(h.date)}</span>
                  <span className="text-gray-700">{h.name}</span>
                  <span className="ml-auto text-xs text-gray-500 capitalize">
                    {h.type === "joint_leave" ? "Cuti Bersama" : h.type === "religious" ? "Keagamaan" : "Nasional"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Harga "Holiday" akan otomatis diterapkan pada tanggal-tanggal di atas
            </p>
          </div>
        )}

        {/* Courts Pricing */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">🏟️ Atur Harga per Lapangan</h2>
          
          {courts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              Belum ada lapangan yang terdaftar. Silakan tambahkan lapangan terlebih dahulu.
            </div>
          ) : (
            courts.map((court) => {
              const courtRules = getCourtRules(court.id);
              const isEditing = editingCourt === court.id;

              return (
                <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900">{court.name}</h3>
                      <p className="text-sm text-gray-500">{getVenueName(court.venueId)}</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setEditingCourt(court.id)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors"
                      >
                        + Tambah Aturan
                      </button>
                    )}
                  </div>

                  {/* Current Rules */}
                  {courtRules.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {courtRules.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            rule.dayType === "holiday" ? "bg-red-100 text-red-700" :
                            rule.dayType === "weekend" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {rule.dayType === "holiday" ? "🔴 Holiday" : rule.dayType === "weekend" ? "🔵 Weekend" : "⚪ Weekday"}
                          </span>
                          <span className="text-sm text-gray-700">{rule.startTime} - {rule.endTime}</span>
                          <span className="ml-auto font-bold text-gray-900">{formatRupiah(rule.pricePerHour)}/jam</span>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {courtRules.length === 0 && !isEditing && (
                    <div className="text-sm text-gray-500 mb-4">
                      Belum ada aturan harga. Klik "Tambah Aturan" untuk mulai mengatur.
                    </div>
                  )}

                  {/* Add Rule Form */}
                  {isEditing && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Tambah Aturan Harga Baru</h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tipe Hari</label>
                          <select
                            value={newRule.dayType}
                            onChange={(e) => setNewRule({ ...newRule, dayType: e.target.value as PricingRule["dayType"] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          >
                            <option value="weekday">Weekday</option>
                            <option value="weekend">Weekend</option>
                            <option value="holiday">Holiday</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Jam Mulai</label>
                          <input
                            type="time"
                            value={newRule.startTime}
                            onChange={(e) => setNewRule({ ...newRule, startTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Jam Selesai</label>
                          <input
                            type="time"
                            value={newRule.endTime}
                            onChange={(e) => setNewRule({ ...newRule, endTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Harga per Jam</label>
                          <input
                            type="number"
                            value={newRule.pricePerHour}
                            onChange={(e) => setNewRule({ ...newRule, pricePerHour: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            min="0"
                            step="10000"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            onClick={() => handleAddRule(court.id)}
                            disabled={saving}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                          >
                            {saving ? "..." : "Simpan"}
                          </button>
                          <button
                            onClick={() => setEditingCourt(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

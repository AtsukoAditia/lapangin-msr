"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import type { PricingRule } from "@/lib/types/domain";

const DAY_TYPE_LABELS: Record<string, string> = {
  weekday: "Hari Kerja",
  weekend: "Weekend",
  holiday: "Libur",
  all: "Semua Hari",
};

export default function AdminPricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    courtId: "",
    dayType: "weekday" as PricingRule["dayType"],
    startTime: "08:00",
    endTime: "22:00",
    pricePerHour: 0,
    priority: 0,
  });

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      return (data.rules ?? []) as PricingRule[];
    } catch (err) {
      console.error("Failed to fetch pricing rules:", err);
      return [] as PricingRule[];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRules().then((result) => {
      if (!cancelled) {
        setRules(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchRules]);

  function resetForm() {
    setForm({
      courtId: "",
      dayType: "weekday",
      startTime: "08:00",
      endTime: "22:00",
      pricePerHour: 0,
      priority: 0,
    });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(rule: PricingRule) {
    setEditingId(rule.id);
    setForm({
      courtId: rule.courtId,
      dayType: rule.dayType,
      startTime: rule.startTime,
      endTime: rule.endTime,
      pricePerHour: rule.pricePerHour,
      priority: rule.priority,
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.courtId || !form.pricePerHour) {
      alert("Court ID dan harga wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;

      const res = await fetch("/api/admin/pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal menyimpan aturan harga");
        return;
      }

      const result = await fetchRules();
      setRules(result);
      resetForm();
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Gagal menyimpan aturan harga");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus aturan harga ini?")) return;

    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal menghapus");
        return;
      }

      const result = await fetchRules();
      setRules(result);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Gagal menghapus aturan harga");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Harga</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          {showForm ? "✕ Tutup" : "+ Tambah Aturan"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="mb-3 text-sm font-semibold text-emerald-800">
            {editingId ? "Edit Aturan Harga" : "Tambah Aturan Harga Baru"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Court ID
              </label>
              <input
                type="text"
                value={form.courtId}
                onChange={(e) => setForm({ ...form, courtId: e.target.value })}
                placeholder="cth: court-futsal-a"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Tipe Hari
              </label>
              <select
                value={form.dayType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dayType: e.target.value as PricingRule["dayType"],
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="weekday">Hari Kerja</option>
                <option value="weekend">Weekend</option>
                <option value="holiday">Libur</option>
                <option value="all">Semua Hari</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Harga per Jam (Rp)
              </label>
              <input
                type="number"
                value={form.pricePerHour}
                onChange={(e) =>
                  setForm({ ...form, pricePerHour: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Jam Mulai
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Jam Selesai
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Prioritas
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              disabled={saving}
              onClick={handleSubmit}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "💾 Simpan"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-4xl">💰</p>
          <p className="mt-2 text-slate-500">Belum ada aturan harga</p>
          <p className="mt-1 text-sm text-slate-400">
            Tambahkan aturan harga untuk mengatur tarif lapangan
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-700">
                    {rule.courtId}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {DAY_TYPE_LABELS[rule.dayType] ?? rule.dayType}
                  </span>
                  {rule.priority > 0 && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                      Prioritas: {rule.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {rule.startTime} – {rule.endTime} · Rp{" "}
                  {rule.pricePerHour.toLocaleString("id-ID")}/jam
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(rule)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(rule.id)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
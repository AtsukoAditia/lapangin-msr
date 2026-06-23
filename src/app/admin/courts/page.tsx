"use client";

import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import type { Court } from "@/lib/types/domain";

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Court>>({});
  const [saving, setSaving] = useState(false);

  const fetchCourts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/courts");
      const data = await res.json();
      return (data.courts ?? []) as Court[];
    } catch (err) {
      console.error("Failed to fetch courts:", err);
      return [] as Court[];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCourts().then((result) => {
      if (!cancelled) {
        setCourts(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchCourts]);

  function startEdit(court: Court) {
    setEditingId(court.id);
    setEditForm({
      name: court.name,
      basePrice: court.basePrice,
      isActive: court.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editForm }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal update lapangan");
        return;
      }

      const result = await fetchCourts();
      setCourts(result);
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Gagal update lapangan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Kelola Lapangan
      </h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      ) : courts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-4xl">🏟️</p>
          <p className="mt-2 text-slate-500">Belum ada lapangan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courts.map((court) => {
            const isEditing = editingId === court.id;

            return (
              <div
                key={court.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Nama Lapangan
                      </label>
                      <input
                        type="text"
                        value={editForm.name ?? ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Harga Dasar (per jam)
                      </label>
                      <input
                        type="number"
                        value={editForm.basePrice ?? 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            basePrice: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`active-${court.id}`}
                        checked={editForm.isActive ?? true}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            isActive: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded"
                      />
                      <label
                        htmlFor={`active-${court.id}`}
                        className="text-sm text-slate-700"
                      >
                        Aktif
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={saving}
                        onClick={() => saveEdit(court.id)}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {saving ? "Menyimpan..." : "💾 Simpan"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {court.name}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {court.sportId}
                        </span>
                        {court.isActive ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        Kapasitas {court.capacity} orang · Rp{" "}
                        {court.basePrice.toLocaleString("id-ID")}/jam
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(court)}
                      className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
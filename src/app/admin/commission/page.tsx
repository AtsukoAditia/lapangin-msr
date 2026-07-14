"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface CommissionVenue {
  venueId: string;
  venueName: string;
  commissionRate: number;
  platformFeeType: string;
  platformFeeValue: number;
  totalRevenue: number;
  totalCommission: number;
  ownerPayout: number;
  bookingCount: number;
}

interface CommissionData {
  summary: {
    totalRevenue: number;
    totalCommission: number;
    ownerPayout: number;
    venueCount: number;
  };
  venues: CommissionVenue[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function CommissionPage() {
  const [data, setData] = useState<CommissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editRate, setEditRate] = useState(10);
  const [editFeeType, setEditFeeType] = useState<"percentage" | "fixed">("percentage");
  const [editFeeValue, setEditFeeValue] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch("/api/admin/commission")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (v: CommissionVenue) => {
    setEditing(v.venueId);
    setEditRate(v.commissionRate);
    setEditFeeType(v.platformFeeType as "percentage" | "fixed");
    setEditFeeValue(v.platformFeeValue);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch("/api/admin/commission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId: editing,
        commissionRate: editRate,
        platformFeeType: editFeeType,
        platformFeeValue: editFeeValue,
      }),
    });
    setEditing(null);
    setSaving(false);
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💰 Pengaturan Komisi</h1>
          <p className="text-gray-500 text-sm">Kelola komisi platform per venue</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-500">Gagal memuat data</div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">{fmt(data.summary.totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs text-gray-500 mb-1">Total Komisi</p>
                <p className="text-xl font-bold text-emerald-600">{fmt(data.summary.totalCommission)}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs text-gray-500 mb-1">Payout Owner</p>
                <p className="text-xl font-bold text-gray-900">{fmt(data.summary.ownerPayout)}</p>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs text-gray-500 mb-1">Jumlah Venue</p>
                <p className="text-xl font-bold text-gray-900">{data.summary.venueCount}</p>
              </div>
            </div>

            {/* Venue list */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">Venue</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Rate</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Tipe Fee</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Revenue</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Komisi</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden md:table-cell">Payout</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.venues.map((v) => (
                    <tr key={v.venueId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{v.venueName}</td>
                      <td className="px-4 py-3 text-gray-700">{v.commissionRate}%</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                        {v.platformFeeType === "fixed" ? `Fixed: ${fmt(v.platformFeeValue)}` : "Persentase"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(v.totalRevenue)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{fmt(v.totalCommission)}</td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden md:table-cell">{fmt(v.ownerPayout)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => startEdit(v)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit modal */}
            {editing && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Komisi</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                      <select
                        value={editFeeType}
                        onChange={(e) => setEditFeeType(e.target.value as "percentage" | "fixed")}
                        className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Fixed (Rp)</option>
                      </select>
                    </div>
                    {editFeeType === "percentage" ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={editRate}
                          onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fee per Booking (Rp)</label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={editFeeValue}
                          onChange={(e) => setEditFeeValue(parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Batal</button>
                    <button
                      onClick={save}
                      disabled={saving}
                      className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

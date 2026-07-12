"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface VenueOwner {
  id: string;
  adminId: string;
  businessName: string;
  picName: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_review: { label: "Menunggu Review", color: "bg-amber-100 text-amber-800" },
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-800" },
  suspended: { label: "Suspended", color: "bg-red-100 text-red-800" },
  rejected: { label: "Ditolak", color: "bg-gray-100 text-gray-800" },
};

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<VenueOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchOwners() {
    try {
      const res = await fetch("/api/admin/owners");
      const data = await res.json();
      setOwners(data.owners ?? []);
    } catch {
      console.error("Failed to fetch owners");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOwners(); }, []);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/owners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal update status");
        return;
      }
      await fetchOwners();
    } catch {
      alert("Gagal update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Kelola Owner</h1>
            <p className="text-gray-500 text-sm mt-1">Review dan kelola pendaftaran owner venue</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold ${val.color}`}>
                {val.label}: {owners.filter(o => o.status === key).length}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
          </div>
        ) : owners.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
            <p className="text-4xl mb-2">🏟️</p>
            <p>Belum ada pendaftaran owner</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Venue/Bisnis</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">PIC</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Telepon</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Tanggal</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {owners.map((owner) => {
                    const statusInfo = STATUS_LABELS[owner.status] ?? { label: owner.status, color: "bg-gray-100 text-gray-800" };
                    return (
                      <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{owner.businessName}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{owner.picName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{owner.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{owner.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(owner.createdAt).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {owner.status === "pending_review" && (
                              <>
                                <button
                                  onClick={() => updateStatus(owner.id, "active")}
                                  disabled={updatingId === owner.id}
                                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                                >
                                  ✅ Setujui
                                </button>
                                <button
                                  onClick={() => updateStatus(owner.id, "rejected")}
                                  disabled={updatingId === owner.id}
                                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                                >
                                  ❌ Tolak
                                </button>
                              </>
                            )}
                            {owner.status === "active" && (
                              <button
                                onClick={() => updateStatus(owner.id, "suspended")}
                                disabled={updatingId === owner.id}
                                className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
                              >
                                ⏸️ Suspend
                              </button>
                            )}
                            {owner.status === "suspended" && (
                              <button
                                onClick={() => updateStatus(owner.id, "active")}
                                disabled={updatingId === owner.id}
                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                              >
                                ✅ Aktifkan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

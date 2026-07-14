"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface PendingVenue {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  description: string;
  facilities: string[] | null;
  open_time: string;
  close_time: string;
  maps_url: string;
  business_name: string;
  pic_name: string;
  created_at: string;
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<PendingVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/venues")
      .then((r) => r.json())
      .then((d) => setVenues(d.venues ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: "active" | "rejected") {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/venues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setVenues((prev) => prev.filter((v) => v.id !== id));
      } else {
        const d = await res.json();
        alert(d.error ?? "Gagal update");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Venue Menunggu Approval</h1>
            <p className="text-gray-500 text-sm mt-1">
              {venues.length} venue menunggu review
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 rounded-full mx-auto" />
          </div>
        ) : venues.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-lg font-bold text-gray-700">Semua venue sudah diapprove!</p>
            <p className="text-gray-500 mt-1">Tidak ada venue yang menunggu review</p>
          </div>
        ) : (
          <div className="space-y-3">
            {venues.map((venue) => {
              const facilities = Array.isArray(venue.facilities) ? venue.facilities : [];
              return (
                <div
                  key={venue.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{venue.name}</h3>
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full shrink-0">
                            Menunggu Review
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          👤 {venue.pic_name} · {venue.business_name}
                        </p>
                        <p className="text-sm text-gray-500">📍 {venue.address}</p>
                        {venue.phone && <p className="text-sm text-gray-500">📞 {venue.phone}</p>}
                        {venue.description && (
                          <p className="text-sm text-gray-600 mt-2">{venue.description}</p>
                        )}
                        {facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {facilities.map((f) => (
                              <span
                                key={f}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() =>
                            updateStatus(venue.id, "active")
                          }
                          disabled={updatingId === venue.id}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() =>
                            updateStatus(venue.id, "rejected")
                          }
                          disabled={updatingId === venue.id}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50"
                        >
                          ❌ Tolak
                        </button>
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === venue.id ? null : venue.id)
                          }
                          className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {expandedId === venue.id ? "▲ Sembunyikan" : "▼ Detail"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedId === venue.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Jam Operasional</p>
                          <p className="text-gray-700">
                            {venue.open_time?.slice(0, 5) ?? "—"} – {venue.close_time?.slice(0, 5) ?? "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Slug</p>
                          <p className="text-gray-700 font-mono text-xs">{venue.slug}</p>
                        </div>
                        {venue.maps_url && (
                          <div className="col-span-2">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Google Maps</p>
                            <a
                              href={venue.maps_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline text-xs"
                            >
                              {venue.maps_url}
                            </a>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tanggal Submit</p>
                          <p className="text-gray-700">
                            {new Date(venue.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

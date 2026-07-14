"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  approvalStatus: string;
  isActive: boolean;
  createdAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  pending_review: { label: "Menunggu Review", color: "bg-amber-100 text-amber-800" },
  active: { label: "Aktif", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
  suspended: { label: "Suspended", color: "bg-orange-100 text-orange-700" },
};

export default function OwnerVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/venues")
      .then((r) => r.json())
      .then((d) => setVenues(d.venues ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">Venue Saya</h1>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Venue Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola venue yang Anda miliki</p>
        </div>
        <Link
          href="/dashboard/venues/new"
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
        >
          + Tambah Venue
        </Link>
      </div>

      {venues.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-5xl mb-4">🏟️</p>
          <p className="text-lg font-bold text-gray-700 mb-2">Belum ada venue</p>
          <p className="text-gray-500 mb-6">Mulai dengan menambahkan venue pertama Anda</p>
          <Link
            href="/dashboard/venues/new"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
          >
            + Tambah Venue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {venues.map((venue) => {
            const statusInfo = STATUS_CONFIG[venue.approvalStatus] ?? STATUS_CONFIG.draft;
            return (
              <div
                key={venue.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{venue.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">📍 {venue.address}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {venue.approvalStatus === "draft" && (
                      <Link
                        href={`/dashboard/venues/new?edit=${venue.id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

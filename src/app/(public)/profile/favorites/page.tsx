"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface FavoriteVenue {
  id: string;
  name: string;
  address: string;
  avgRating: number;
  reviewCount: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/favorites")
      .then((r) => r.json())
      .then((d) => setFavorites(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(venueId: string) {
    if (!confirm("Hapus dari favorit?")) return;
    try {
      const res = await fetch("/api/customer/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((v) => v.id !== venueId));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
        <div className="mx-auto max-w-lg px-4 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-red-100 hover:text-white font-medium mb-4"
          >
            ← Profil
          </Link>
          <h1 className="text-2xl font-black">❤️ Venue Favorit</h1>
          <p className="mt-1 text-sm text-red-100">
            {favorites.length} venue tersimpan
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
            <p className="text-4xl mb-3">❤️</p>
            <p className="text-lg font-bold text-slate-700">Belum ada favorit</p>
            <p className="text-sm text-slate-500 mt-1">
              Tap ikon hati di halaman venue untuk menyimpan favorit
            </p>
            <Link
              href="/cari"
              className="inline-block mt-4 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Cari Venue →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((venue) => (
              <div
                key={venue.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        📍 {venue.address || "-"}
                      </p>
                      {venue.reviewCount > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg
                                key={s}
                                className={`h-3.5 w-3.5 ${s <= Math.round(venue.avgRating) ? "text-amber-400" : "text-slate-200"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {venue.avgRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({venue.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Link
                        href={`/cari?venue=${venue.id}`}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        Booking
                      </Link>
                      <button
                        onClick={() => handleRemove(venue.id)}
                        className="rounded-lg bg-red-50 px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                      >
                        ❤️‍🔥
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

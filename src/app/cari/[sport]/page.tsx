"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { sportEmoji } from "@/lib/sport-icons";

interface CourtResult {
  courtId: string;
  courtName: string;
  courtSlug: string;
  surfaceType: string;
  indoorType: string;
  capacity: number;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  venueId: string;
  venueName: string;
  venueSlug: string;
  venueAddress: string;
  openTime: string;
  closeTime: string;
  areaId: string;
  areaLabel: string;
  areaCity: string;
  areaProvince: string;
}

interface Area {
  id: string;
  label: string;
  city: string;
  province: string;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function SearchPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: sportSlug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courts, setCourts] = useState<CourtResult[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter state from URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [areaId, setAreaId] = useState(searchParams.get("areaId") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "name");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Fetch areas
  useEffect(() => {
    fetch("/api/areas")
      .then((r) => r.json())
      .then((d) => setAreas(d.data || d.areas || []))
      .catch(() => {});
  }, []);

  // Fetch courts
  const fetchCourts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sport", sportSlug);
    if (search) params.set("q", search);
    if (areaId) params.set("areaId", areaId);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/search/courts?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setCourts(d.courts || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {
        setCourts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [sportSlug, search, areaId, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  // Update URL
  const updateUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (areaId) p.set("areaId", areaId);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (sort !== "name") p.set("sort", sort);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    router.replace(`/cari/${sportSlug}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [search, areaId, minPrice, maxPrice, sort, page, sportSlug, router]);

  useEffect(() => {
    const timeout = setTimeout(updateUrl, 300);
    return () => clearTimeout(timeout);
  }, [updateUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAreaId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("name");
    setPage(1);
  };

  const sportName = sportSlug.charAt(0).toUpperCase() + sportSlug.slice(1).replace(/-/g, " ");
  const emoji = sportEmoji[sportSlug] || "🏟️";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-100 hover:text-white font-medium mb-4"
          >
            ← Beranda
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{emoji}</span>
            <h1 className="text-2xl font-black sm:text-3xl">{sportName}</h1>
          </div>
          <p className="text-emerald-100">
            Cari dan booking lapangan {sportName.toLowerCase()} terbaik
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-6 sm:p-5">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari venue atau lapangan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
              <svg className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Area filter */}
              <select
                value={areaId}
                onChange={(e) => { setAreaId(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              >
                <option value="">Semua Daerah</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.city}, {a.province}
                  </option>
                ))}
              </select>

              {/* Min price */}
              <input
                type="number"
                placeholder="Harga min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />

              {/* Max price */}
              <input
                type="number"
                placeholder="Harga max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              >
                <option value="name">Nama A-Z</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
              </select>
            </div>

            {/* Filter actions */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading ? "Mencari..." : `${total} lapangan ditemukan`}
              </p>
              {(search || areaId || minPrice || maxPrice) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-1/2 bg-slate-100 rounded mb-2" />
                <div className="h-4 w-2/3 bg-slate-100 rounded mb-4" />
                <div className="h-6 w-1/3 bg-emerald-100 rounded" />
              </div>
            ))}
          </div>
        ) : courts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-slate-700 mb-2">
              Tidak ada lapangan ditemukan
            </p>
            <p className="text-slate-500 mb-6">
              Coba ubah filter atau kata kunci pencarianmu
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <Link
                  key={court.courtId}
                  href={`/cari/${sportSlug}/${court.courtId}`}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                >
                  {/* Placeholder image */}
                  <div className="h-40 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center relative">
                    <span className="text-6xl opacity-30">{emoji}</span>
                    <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold ${
                      court.indoorType === "indoor"
                        ? "bg-blue-100 text-blue-700"
                        : court.indoorType === "outdoor"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                    }`}>
                      {court.indoorType === "indoor" ? "🏠 Indoor" : court.indoorType === "outdoor" ? "☀️ Outdoor" : "🏕️ Semi Outdoor"}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1 truncate">
                      {court.courtName}
                    </h3>
                    <p className="text-sm text-slate-500 mb-1 truncate">
                      🏟️ {court.venueName}
                    </p>
                    <p className="text-xs text-slate-400 mb-3 truncate">
                      📍 {court.areaCity || court.venueAddress || "Indonesia"}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {court.surfaceType && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {court.surfaceType}
                        </span>
                      )}
                      {court.capacity > 0 && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          👥 {court.capacity} org
                        </span>
                      )}
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        ⏰ {court.openTime?.slice(0, 5)}–{court.closeTime?.slice(0, 5)}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-lg font-black text-emerald-700">
                          {formatPrice(court.minPrice)}
                          {court.minPrice !== court.maxPrice && (
                            <span className="text-xs font-normal text-slate-400"> – {formatPrice(court.maxPrice)}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">/ jam</p>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        Lihat Detail →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        page === pageNum
                          ? "bg-emerald-600 text-white shadow"
                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sportEmoji } from "@/lib/sport-icons";
import Link from "next/link";
import BookingSteps from "@/components/booking/BookingSteps";
import AreaSelect from "@/components/booking/AreaSelect";
import type { Area, Sport } from "@/lib/types/domain";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [areas, setAreas] = useState<Area[]>([]);
  const [availableSports, setAvailableSports] = useState<Sport[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>();
  const [isSportsVisible, setIsSportsVisible] = useState(false);
  const [isSportsLoading, setIsSportsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const initializedRef = useRef(false);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [areasRes, sportsRes] = await Promise.all([
          fetch("/api/areas"),
          fetch("/api/sports"),
        ]);

        const areasData = await areasRes.json();
        await sportsRes.json();

        setAreas(areasData.data || areasData.areas || []);

        // Initialize from URL param after areas are loaded
        const areaParam = searchParams.get("area");
        if (areaParam && !initializedRef.current) {
          initializedRef.current = true;
          setSelectedAreaId(areaParam);
          setIsSportsVisible(true);
          setIsSportsLoading(true);

          const response = await fetch(`/api/sports/by-area/${areaParam}`);
          const data = await response.json();
          setAvailableSports(data.sports || []);
          setIsSportsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle area selection changes
  const handleAreaChange = useCallback(
    async (areaId: string | null) => {
      const newAreaId = areaId || undefined;
      setSelectedAreaId(newAreaId);
      setSearchQuery(""); // Reset search when area changes

      // Update URL without full page reload
      const params = new URLSearchParams(searchParams.toString());
      if (newAreaId) {
        params.set("area", newAreaId);
      } else {
        params.delete("area");
      }
      router.replace(`/booking?${params.toString()}`, { scroll: false });

      if (newAreaId) {
        setIsSportsLoading(true);
        setIsSportsVisible(true);

        try {
          const response = await fetch(`/api/sports/by-area/${newAreaId}`);
          const data = await response.json();
          setAvailableSports(data.sports || []);
        } catch (error) {
          console.error("Error fetching sports by area:", error);
          setAvailableSports([]);
        } finally {
          setIsSportsLoading(false);
        }
      } else {
        setAvailableSports([]);
        setIsSportsVisible(false);
      }
    },
    [router, searchParams]
  );

  const activeAreas = areas.filter((a) => a.isActive);

  // Filter sports based on search query
  const filteredSports = availableSports.filter((sport) =>
    sport.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <BookingSteps
        currentStep={1}
        title="Cari Lapangan Olahraga"
        subtitle="Pilih daerah dan olahraga yang ingin kamu mainkan."
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12">
        {/* Area Selection */}
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Lokasi
          </h2>
          <AreaSelect
            areas={activeAreas}
            selectedAreaId={selectedAreaId}
            onAreaChange={handleAreaChange}
          />
        </section>

        {/* Sport Selection */}
        <section
          className={`transition-all duration-400 ease-out overflow-hidden ${
            isSportsVisible ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`transform transition-all duration-400 ease-out ${
              isSportsVisible ? "translate-y-0" : "-translate-y-2"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Olahraga
                {availableSports.length > 0 && !isSportsLoading && (
                  <span className="ml-2 text-emerald-600 font-bold normal-case">
                    {availableSports.length}
                  </span>
                )}
              </h2>
              
              {availableSports.length > 0 && !isSportsLoading && (
                <div className="relative w-48">
                  <svg
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {isSportsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-100 animate-pulse"
                  >
                    <div className="w-10 h-10 mx-auto mb-2 bg-gray-200 rounded-lg" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            ) : filteredSports.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {filteredSports.map((sport) => (
                  <Link
                    key={sport.id}
                    href={`/booking/${sport.slug}${selectedAreaId ? `?areaId=${selectedAreaId}` : ""}`}
                    className="group bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-100 hover:border-emerald-300 hover:shadow-md active:scale-[0.98] transition-all duration-150"
                  >
                    <span className="text-3xl sm:text-4xl block mb-1.5 group-hover:scale-105 transition-transform">
                      {sportEmoji[sport.id] || sportEmoji[sport.name.toLowerCase()] || "🏅"}
                    </span>
                    <h3 className="font-medium text-gray-800 text-xs sm:text-sm truncate group-hover:text-emerald-700">
                      {sport.name}
                    </h3>
                  </Link>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-10 px-4 text-center">
                <span className="text-4xl block mb-3">🔍</span>
                <p className="text-gray-500 text-sm mb-3">
                  Tidak ada `{searchQuery}`
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-10 px-4 text-center">
                <span className="text-4xl block mb-3">🏟️</span>
                <p className="text-gray-500 text-sm">
                  {selectedAreaId
                    ? "Belum ada venue di lokasi ini."
                    : "Pilih lokasi terlebih dahulu."}
                </p>
                {selectedAreaId && (
                  <button
                    onClick={() => handleAreaChange(null)}
                    className="mt-3 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Ganti Lokasi
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-600 transition-colors"
          >
            ← Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingIndexPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">⚽</span>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Memuat data...</p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
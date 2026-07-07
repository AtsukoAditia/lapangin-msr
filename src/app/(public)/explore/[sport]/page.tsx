import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatabaseAdapter } from "@/lib/adapters";
import { formatPrice, mockSports } from "@/lib/mock-data";
import { sportEmoji } from "@/lib/sport-icons";
import type { Court, Venue, Area } from "@/lib/types/domain";

type Props = {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ area?: string; page?: string }>;
};

const PER_PAGE = 9;

export function generateStaticParams() {
  return mockSports.map((s) => ({ sport: s.slug }));
}

export default async function ExploreSportPage({ params, searchParams }: Props) {
  const { sport: sportSlug } = await params;
  const { area, page } = await searchParams;
  const adapter = getDatabaseAdapter();

  const [sports, allVenues, allCourts, allAreas] = await Promise.all([
    adapter.getSports(),
    adapter.getVenues(),
    adapter.getCourts(),
    adapter.getAreas(),
  ]);

  const sport = sports.find((s) => s.slug === sportSlug);
  if (!sport) return notFound();

  // Get all courts for this sport, join with venues
  const sportCourts = allCourts.filter(
    (c) => c.sportId === sport.id && c.isActive,
  );

  // Build venue map for quick lookup
  const venueMap = new Map<string, Venue>();
  for (const v of allVenues) {
    if (v.isActive && v.approvalStatus === "active") venueMap.set(v.id, v);
  }

  // Build area map
  const areaMap = new Map<string, Area>();
  for (const a of allAreas) {
    if (a.isActive) areaMap.set(a.id, a);
  }

  // Filter courts whose venue is active and belongs to selected area
  const filtered = sportCourts.filter((c) => {
    const venue = venueMap.get(c.venueId);
    if (!venue) return false;
    if (area && venue.areaId !== area) return false;
    return true;
  });

  // Collect unique areas that have courts for this sport
  const areaIds = new Set<string>();
  for (const c of sportCourts) {
    const v = venueMap.get(c.venueId);
    if (v?.areaId) areaIds.add(v.areaId);
  }
  const availableAreas = allAreas.filter(
    (a) => areaIds.has(a.id) && a.isActive,
  );

  // Sort courts by venue name then court name
  filtered.sort((a, b) => {
    const va = venueMap.get(a.venueId)?.name ?? "";
    const vb = venueMap.get(b.venueId)?.name ?? "";
    if (va !== vb) return va.localeCompare(vb);
    return a.name.localeCompare(b.name);
  });

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(Math.max(1, parseInt(page ?? "1", 10) || 1), totalPages);
  const paged = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // Group paged courts by venue
  type CourtWithVenue = Court & { venue: Venue; area?: Area };
  const grouped = new Map<string, CourtWithVenue[]>();
  for (const c of paged) {
    const venue = venueMap.get(c.venueId)!;
    const key = venue.id;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push({ ...c, venue, area: areaMap.get(venue.areaId ?? "") });
  }

  const buildUrl = (p: number, a?: string) => {
    const sp = new URLSearchParams();
    if (a) sp.set("area", a);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/explore/${sportSlug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
          <nav className="mb-4 text-sm text-emerald-200">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-white">Eksplor {sport.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{sportEmoji[sport.id] || "🏅"}</span>
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">
                Lapangan {sport.name}
              </h1>
              <p className="mt-1 text-sm text-emerald-100">
                {total} lapangan tersedia{area ? ` di daerah ini` : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" className="w-full">
            <path d="M0 50V25C360 0 720 15 1080 10C1260 7 1380 20 1440 25V50H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Area Filter */}
        {availableAreas.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={buildUrl(1)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                !area
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
              }`}
            >
              Semua Daerah
            </Link>
            {availableAreas.map((a) => (
              <Link
                key={a.id}
                href={buildUrl(1, a.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  area === a.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                {a.city}
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {paged.length === 0 && (
          <div className="py-20 text-center">
            <p className="mb-3 text-5xl">🏟️</p>
            <p className="text-lg font-semibold text-slate-700">
              Belum ada lapangan ditemukan.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {area
                ? "Coba pilih daerah lain atau lihat semua daerah."
                : "Datanya akan segera tersedia."}
            </p>
            {area && (
              <Link
                href={buildUrl(1)}
                className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Lihat Semua Daerah
              </Link>
            )}
          </div>
        )}

        {/* Court Cards Grouped by Venue */}
        {[...grouped.entries()].map(([venueId, courts]) => {
          const first = courts[0];
          return (
            <section key={venueId} className="mb-10">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {first.venue.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {first.area && (
                    <span>
                      📍 {first.area.city}, {first.area.province}
                    </span>
                  )}
                  {first.venue.address && (
                    <span className="before:content-['·'] before:mx-1">
                      {first.venue.address}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courts.map((court) => (
                  <Link
                    key={court.id}
                    href={`/explore/${sportSlug}/${first.venue.slug}/${court.slug}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-400 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    {/* Color top accent */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 transition group-hover:opacity-100" />

                    <div className="p-5">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {court.name}
                        </h3>
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          {court.indoorType === "indoor"
                            ? "🏠 Indoor"
                            : court.indoorType === "semi_outdoor"
                              ? "🌤 Semi"
                              : "☀️ Outdoor"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
                        {court.surfaceType && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5">
                            {court.surfaceType}
                          </span>
                        )}
                        {court.capacity && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5">
                            {court.capacity} orang
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-end justify-between">
                        <p className="text-lg font-black text-emerald-700">
                          {formatPrice(court.basePrice)}
                          <span className="ml-0.5 text-xs font-semibold text-slate-500">
                            / jam
                          </span>
                        </p>
                        <span className="text-xs font-semibold text-emerald-600 opacity-0 transition group-hover:opacity-100">
                          Lihat Detail →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2">
            {currentPage > 1 && (
              <Link
                href={buildUrl(currentPage - 1, area)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                ← Sebelumnya
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildUrl(p, area)}
                className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                  p === currentPage
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
                } flex items-center justify-center`}
              >
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={buildUrl(currentPage + 1, area)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700"
              >
                Selanjutnya →
              </Link>
            )}
          </nav>
        )}

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Kembali ke Pilih Olahraga
          </Link>
        </div>
      </main>
    </div>
  );
}
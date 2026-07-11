import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatabaseAdapter } from "@/lib/adapters";
import { formatPrice, mockSports } from "@/lib/mock-data";
import BookingSteps from "@/components/booking/BookingSteps";
import { sportEmoji } from "@/lib/sport-icons";

type Props = {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ areaId?: string }>;
};

export function generateStaticParams() {
  return mockSports.map((s) => ({ sport: s.slug }));
}

export default async function SportPage({ params, searchParams }: Props) {
  const { sport: sportSlug } = await params;
  const { areaId } = await searchParams;
  const adapter = getDatabaseAdapter();

  const [sports, venues, courts, areas] = await Promise.all([
    adapter.getSports(),
    adapter.getVenues(),
    adapter.getCourts(),
    adapter.getAreas(),
  ]);

  const sport = sports.find((s) => s.slug === sportSlug);
  if (!sport) return notFound();

  // Filter venues that have courts for this sport
  const sportCourtIds = courts
    .filter((c) => c.sportId === sport.id)
    .map((c) => c.venueId);
  let filteredVenues = venues.filter(
    (v) =>
      v.isActive &&
      v.approvalStatus === "active" &&
      sportCourtIds.includes(v.id),
  );

  // Filter by area if selected
  if (areaId) {
    filteredVenues = filteredVenues.filter((v) => v.areaId === areaId);
  }

  const selectedArea = areaId
    ? areas.find((a) => a.id === areaId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <BookingSteps
        currentStep={2}
        title={`${sportEmoji[sport.id] || "🏅"} Lapangan ${sport.name}`}
        subtitle={
          selectedArea
            ? `Menampilkan venue di ${selectedArea.city}, ${selectedArea.province}`
            : "Pilih venue dan lapangan yang tersedia."
        }
        steps={[
          { number: 1, label: "Pilih Olahraga", href: "/booking", icon: "🏆" },
          { number: 2, label: "Pilih Lapangan", icon: "🏟️" },
          { number: 3, label: "Pilih Jam Main", icon: "⏰" },
          { number: 4, label: "Data Pelanggan", icon: "👤" },
          { number: 5, label: "Pembayaran", icon: "💳" },
          { number: 6, label: "Konfirmasi", icon: "✅" },
        ]}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href={`/booking${areaId ? `?area=${areaId}` : ""}`}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          ← Ganti Olahraga / Daerah
        </Link>

        {filteredVenues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🏟️</p>
            <p className="text-slate-500 text-lg">
              {areaId
                ? "Belum ada venue di daerah ini untuk olahraga ini."
                : "Belum ada venue yang menyediakan olahraga ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredVenues.map((venue) => {
              const venueCourts = courts.filter(
                (c) => c.venueId === venue.id && c.sportId === sport.id,
              );
              const area = areas.find((a) => a.id === venue.areaId);
              return (
                <section key={venue.id}>
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {venue.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      {area && (
                        <span>
                          📍 {area.city}, {area.province}
                        </span>
                      )}
                      {venue.address && (
                        <span className="before:content-['·'] before:mx-1">
                          {venue.address}
                        </span>
                      )}
                      {venue.avgRating && venue.avgRating > 0 && (
                        <span className="before:content-['·'] before:mx-1 text-yellow-600">
                          ★ {venue.avgRating.toFixed(1)} ({venue.reviewCount} review)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {venueCourts.map((court) => (
                      <Link
                        key={court.id}
                        href={`/booking/${sport.slug}/${venue.slug}/${court.slug}`}
                        className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">
                            {court.name}
                          </h3>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {court.indoorType === "indoor" ? "Indoor" : "Outdoor"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {court.surfaceType && (
                            <span className="rounded bg-slate-100 px-2 py-0.5">
                              {court.surfaceType}
                            </span>
                          )}
                          {court.capacity && (
                            <span className="rounded bg-slate-100 px-2 py-0.5">
                              {court.capacity} orang
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm font-bold text-emerald-700">
                          Mulai {formatPrice(court.basePrice)}
                          <span className="font-normal text-slate-500">
                            {" "}
                            / jam
                          </span>
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSportBySlug,
  getVenueBySlug,
  getCourtBySlug,
  getPricingForCourt,
  formatPrice,
  mockSports,
  mockVenues,
  mockCourts,
} from "@/lib/mock-data";
import SlotSelector from "@/components/booking/SlotSelector";
import BookingSteps from "@/components/booking/BookingSteps";

type Props = {
  params: Promise<{ sport: string; venue: string; court: string }>;
};

export function generateStaticParams() {
  const paths: { sport: string; venue: string; court: string }[] = [];
  for (const sport of mockSports) {
    for (const venue of mockVenues) {
      const courts = mockCourts.filter(
        (c) => c.sportId === sport.id && c.venueId === venue.id && c.isActive
      );
      for (const court of courts) {
        paths.push({
          sport: sport.slug,
          venue: venue.slug,
          court: court.slug,
        });
      }
    }
  }
  return paths;
}

export default async function CourtDetailPage({ params }: Props) {
  const { sport: sportSlug, venue: venueSlug, court: courtSlug } =
    await params;

  const sport = getSportBySlug(sportSlug);
  const venue = getVenueBySlug(venueSlug);
  const court = venue ? getCourtBySlug(venueSlug, courtSlug) : undefined;

  if (!sport || !venue || !court) return notFound();

  const pricing = getPricingForCourt(court.id);

  const steps = [
    { number: 1, label: "Pilih Olahraga", href: "/booking" },
    { number: 2, label: "Pilih Venue", href: `/booking/${sport.slug}` },
    { number: 3, label: "Pilih Jadwal" },
    { number: 4, label: "Isi Data" },
    { number: 5, label: "Selesai", href: "/booking" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-8">
      <BookingSteps
        currentStep={3}
        steps={steps}
        title={court.name}
        subtitle={`${venue.name} · ${sport.name}`}
      />
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-800">
          Beranda
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/booking/${sport.slug}`} className="hover:text-slate-800">
          {sport.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-slate-900">{court.name}</span>
      </nav>

      {/* Court Header */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{court.name}</h1>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {court.indoorType === "indoor" ? "Indoor" : "Outdoor"}
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          {venue.name}
          {venue.address && ` — ${venue.address}`}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {court.surfaceType && (
            <span className="rounded bg-slate-100 px-2 py-0.5">
              {court.surfaceType}
            </span>
          )}
          {court.capacity && (
            <span className="rounded bg-slate-100 px-2 py-0.5">
              Kapasitas {court.capacity} orang
            </span>
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5">
            Jam {venue.openTime} – {venue.closeTime}
          </span>
        </div>
      </div>

      {/* Pricing Info */}
      {pricing.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            Harga Sewa
          </h2>
          <div className="space-y-2">
            {pricing.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">
                  {rule.dayType === "weekday"
                    ? "Weekday"
                    : rule.dayType === "weekend"
                      ? "Weekend"
                      : rule.dayType === "holiday"
                        ? "Hari Libur"
                        : "Semua Hari"}{" "}
                  ({rule.startTime} – {rule.endTime})
                </span>
                <span className="font-semibold text-emerald-700">
                  {formatPrice(rule.pricePerHour)}/jam
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Base price fallback */}
      {pricing.length === 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Harga dasar</span>
            <span className="text-lg font-bold text-emerald-700">
              {formatPrice(court.basePrice)}/jam
            </span>
          </div>
        </div>
      )}

      {/* Date & Slot Selection */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          Pilih Tanggal & Jam
        </h2>
        <SlotSelector
          courtId={court.id}
          sportSlug={sport.slug}
          venueSlug={venue.slug}
          courtSlug={court.slug}
          openTime={venue.openTime}
          closeTime={venue.closeTime}
        />
      </div>
    </main>
  );
}
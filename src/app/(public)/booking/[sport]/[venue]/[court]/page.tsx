import Link from "next/link";
import { getDatabaseAdapter } from "@/lib/adapters";
import { formatPrice } from "@/lib/mock-data";
import SlotSelector from "@/components/booking/SlotSelector";
import BookingSteps from "@/components/booking/BookingSteps";
import NotAvailable from "@/components/ui/NotAvailable";

type Props = {
  params: Promise<{ sport: string; venue: string; court: string }>;
};

export default async function CourtDetailPage({ params }: Props) {
  const { sport: sportSlug, venue: venueSlug, court: courtSlug } =
    await params;

  const adapter = getDatabaseAdapter();

  const [sports, venues, courts] = await Promise.all([
    adapter.getSports(),
    adapter.getVenues(),
    adapter.getCourts(),
  ]);

  const sport = sports.find((s) => s.slug === sportSlug && s.isActive);
  const venue = venues.find((v) => v.slug === venueSlug && v.isActive);
  const court = courts.find(
    (c) =>
      c.slug === courtSlug &&
      c.venueId === venue?.id &&
      c.isActive,
  );

  if (!sport || !venue || !court) {
    return (
      <NotAvailable
        title="Lapangan Tidak Tersedia"
        description="Lapangan yang Anda cari tidak ditemukan atau tidak tersedia. Silakan pilih lapangan lain."
        icon="🏟️"
        backHref={`/booking/${sportSlug}`}
        backLabel="Kembali ke Daftar Lapangan"
      />
    );
  }

  const pricing = await adapter.getPricingRules(court.id);

  const steps = [
    { number: 1, label: "Pilih Olahraga", href: "/booking", icon: "🏆" },
    { number: 2, label: "Pilih Lapangan", href: `/booking/${sport.slug}`, icon: "🏟️" },
    { number: 3, label: "Pilih Jam Main", icon: "⏰" },
    { number: 4, label: "Data Pelanggan", icon: "👤" },
    { number: 5, label: "Pembayaran", icon: "💳" },
    { number: 6, label: "Konfirmasi", icon: "✅" },
  ];

  // Format open/close time (strip seconds)
  const fmtTime = (t: string) => {
    const parts = t.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <BookingSteps
        currentStep={3}
        steps={steps}
        title={`${court.name}`}
        subtitle={`${venue.name} · ${venue.address || ""}`}
      />

    <main className="mx-auto max-w-3xl px-4 pb-8 pt-6">
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
            Jam {fmtTime(venue.openTime)} – {fmtTime(venue.closeTime)}
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
          openTime={fmtTime(venue.openTime)}
          closeTime={fmtTime(venue.closeTime)}
        />
      </div>
    </main>
    </div>
  );
}

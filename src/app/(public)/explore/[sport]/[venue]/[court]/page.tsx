import Link from "next/link";
import { notFound } from "next/navigation";
import { getDatabaseAdapter } from "@/lib/adapters";
import { formatPrice } from "@/lib/mock-data";
import { sportEmoji } from "@/lib/sport-icons";

type Props = {
  params: Promise<{ sport: string; venue: string; court: string }>;
};

export default async function ExploreCourtDetailPage({ params }: Props) {
  const { sport: sportSlug, venue: venueSlug, court: courtSlug } = await params;
  const adapter = getDatabaseAdapter();

  const [sports, venues, courts, areas] = await Promise.all([
    adapter.getSports(),
    adapter.getVenues(),
    adapter.getCourts(),
    adapter.getAreas(),
  ]);

  const sport = sports.find((s) => s.slug === sportSlug && s.isActive);
  const venue = venues.find((v) => v.slug === venueSlug && v.isActive);
  const court = courts.find(
    (c) => c.slug === courtSlug && c.venueId === venue?.id && c.isActive,
  );

  if (!sport || !venue || !court) return notFound();

  const area = venue.areaId ? areas.find((a) => a.id === venue.areaId) : null;
  const pricing = await adapter.getPricingRules(court.id);

  // Format open/close time (strip seconds)
  const fmtTime = (t: string) => {
    const parts = t.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <nav className="mb-5 text-sm text-emerald-200">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/explore/${sportSlug}`}
              className="hover:text-white transition-colors"
            >
              {sport.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-white">{court.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <span className="text-4xl sm:text-5xl">
              {sportEmoji[sport.id] || "🏅"}
            </span>
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">{court.name}</h1>
              <p className="mt-1 text-emerald-100">
                {venue.name}
                {area && ` · ${area.city}, ${area.province}`}
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <svg viewBox="0 0 1440 50" fill="none" className="w-full">
            <path
              d="M0 50V25C360 0 720 15 1080 10C1260 7 1380 20 1440 25V50H0Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6">
        {/* Court Visual / Photo */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative h-48 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 sm:h-64">
            {/* Sport-themed background pattern */}
            <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="1" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
              <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" />
            </svg>
            {/* Sport emoji as hero visual */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span className="text-6xl sm:text-7xl drop-shadow-lg">{sportEmoji[sport.id] || "🏟️"}</span>
              <p className="mt-2 text-sm font-semibold text-white/80 tracking-wide uppercase">{court.indoorType === "indoor" ? "Indoor" : court.indoorType === "semi_outdoor" ? "Semi Outdoor" : "Outdoor"}</p>
            </div>
            {/*ponytail: placeholder visual since Court type has no photo field. Upgrade path: add imageUrl to Court type + cloud storage */}
          </div>
        </div>

        {/* Court Info Card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
            Info Lapangan
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Nama Venue"
              value={venue.name}
              icon="🏟️"
            />
            <InfoRow
              label="Lokasi"
              value={
                area
                  ? `${area.city}, ${area.province}`
                  : venue.address || "-"
              }
              icon="📍"
            />
            {venue.address && (
              <InfoRow label="Alamat" value={venue.address} icon="🗺️" />
            )}
            <InfoRow
              label="Tipe"
              value={
                court.indoorType === "indoor"
                  ? "Indoor"
                  : court.indoorType === "semi_outdoor"
                    ? "Semi Outdoor"
                    : "Outdoor"
              }
              icon={
                court.indoorType === "indoor"
                  ? "🏠"
                  : court.indoorType === "semi_outdoor"
                    ? "🌤"
                    : "☀️"
              }
            />
            {court.surfaceType && (
              <InfoRow label="Permukaan" value={court.surfaceType} icon="🟩" />
            )}
            {court.capacity && (
              <InfoRow
                label="Kapasitas"
                value={`${court.capacity} orang`}
                icon="👥"
              />
            )}
            <InfoRow
              label="Jam Operasional"
              value={`${fmtTime(venue.openTime)} – ${fmtTime(venue.closeTime)}`}
              icon="🕐"
            />
            {venue.phone && (
              <InfoRow label="Kontak" value={venue.phone} icon="📞" />
            )}
          </div>
        </div>

        {/* Pricing Card */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">
            Harga Sewa
          </h2>
          {pricing.length > 0 ? (
            <div className="space-y-3">
              {pricing.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-700">
                      {rule.dayType === "weekday"
                        ? "Weekday"
                        : rule.dayType === "weekend"
                          ? "Weekend"
                          : rule.dayType === "holiday"
                            ? "Hari Libur"
                            : "Semua Hari"}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {rule.startTime} – {rule.endTime}
                    </span>
                  </div>
                  <span className="text-base font-bold text-emerald-700">
                    {formatPrice(rule.pricePerHour)}
                    <span className="ml-0.5 text-xs font-medium text-slate-400">
                      /jam
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">
                Harga dasar
              </span>
              <span className="text-lg font-bold text-emerald-700">
                {formatPrice(court.basePrice)}
                <span className="ml-0.5 text-xs font-medium text-slate-400">
                  /jam
                </span>
              </span>
            </div>
          )}
        </div>

        {/* CTA — Book Now */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center shadow-sm">
          <p className="mb-1 text-lg font-bold text-slate-900">
            Siap Main? 🎯
          </p>
          <p className="mb-5 text-sm text-slate-500">
            Pilih tanggal dan jam main yang kamu inginkan.
          </p>
          <Link
            href={`/booking/${sportSlug}/${venueSlug}/${courtSlug}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            📅 Booking Sekarang
            <span>→</span>
          </Link>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link
            href={`/explore/${sportSlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Kembali ke Daftar Lapangan {sport.name}
          </Link>
        </div>
      </main>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-lg">{icon}</span>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
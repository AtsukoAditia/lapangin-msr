import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSportBySlug,
  getVenuesBySport,
  getCourtsBySport,
  formatPrice,
  mockSports,
} from "@/lib/mock-data";
import BookingSteps from "@/components/booking/BookingSteps";
import { sportEmoji } from "@/lib/sport-icons";

type Props = {
  params: Promise<{ sport: string }>;
};

export function generateStaticParams() {
  return mockSports.map((s) => ({ sport: s.slug }));
}

export default async function SportPage({ params }: Props) {
  const { sport: sportSlug } = await params;
  const sport = getSportBySlug(sportSlug);
  if (!sport) return notFound();

  const venues = getVenuesBySport(sport.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <BookingSteps
        currentStep={2}
        title={`${sportEmoji[sport.id] || "🏅"} Lapangan ${sport.name}`}
        subtitle="Pilih venue dan lapangan yang tersedia."
        steps={[
          { number: 1, label: "Pilih Olahraga", href: "/booking" },
          { number: 2, label: "Pilih Lapangan" },
          { number: 3, label: "Pilih Jadwal" },
          { number: 4, label: "Isi Data" },
          { number: 5, label: "Berhasil" },
        ]}
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Back to sport selection */}
        <Link
          href="/booking"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-6"
        >
          ← Ganti Olahraga
        </Link>

        {venues.length === 0 ? (
          <p className="text-slate-500">
            Belum ada venue yang menyediakan olahraga ini.
          </p>
        ) : (
          <div className="space-y-8">
            {venues.map((venue) => {
              const courts = getCourtsBySport(sport.id, venue.id);
              return (
                <section key={venue.id}>
                  <div className="mb-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {venue.name}
                    </h2>
                    {venue.address && (
                      <p className="text-sm text-slate-500">{venue.address}</p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {courts.map((court) => (
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
import { getDatabaseAdapter } from "@/lib/adapters";
import { sportEmoji } from "@/lib/sport-icons";
import Link from "next/link";
import type { Metadata } from "next";
import BookingSteps from "@/components/booking/BookingSteps";

export const metadata: Metadata = {
  title: "Booking Lapangan — Lapangin",
  description: "Cari dan booking lapangan olahraga di daerahmu",
};

export const dynamic = "force-dynamic";

export default async function BookingIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const adapter = getDatabaseAdapter();
  const [sports, areas] = await Promise.all([
    adapter.getSports(),
    adapter.getAreas(),
  ]);
  const { area: selectedAreaId } = await searchParams;
  const activeAreas = areas.filter((a) => a.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <BookingSteps
        currentStep={1}
        title="Cari Lapangan Olahraga 🏟️"
        subtitle="Pilih daerah dan olahraga yang ingin kamu mainkan."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 pb-16">
        {/* Step 1: Area Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            📍 Pilih Daerah
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/booking"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedAreaId
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua Daerah
            </Link>
            {activeAreas.map((area) => (
              <Link
                key={area.id}
                href={`/booking?area=${area.id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedAreaId === area.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {area.city}, {area.province}
              </Link>
            ))}
          </div>
        </div>

        {/* Step 2: Sport Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            🏆 Pilih Olahraga
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/booking/${sport.slug}${selectedAreaId ? `?areaId=${selectedAreaId}` : ""}`}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-300 hover:-translate-y-1 shadow-sm"
              >
                <div className="text-5xl sm:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {sportEmoji[sport.id] || sportEmoji[sport.name.toLowerCase()] || "🏅"}
                </div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">{sport.name}</h2>
                <p className="text-sm text-gray-500">Pilih Venue →</p>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500 ring-opacity-0 group-hover:ring-opacity-100 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors font-medium"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
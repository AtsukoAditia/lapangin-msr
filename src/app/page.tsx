import Link from "next/link";
import { mockSports } from "@/lib/mock-data";
import { sportEmoji, sportColor } from "@/lib/sport-icons";
import { appConfig } from "@/config/app";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Booking Lapangan Olahraga
        </h1>
        <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg">
          Pilih olahraga favoritmu, cek jadwal kosong, dan booking langsung
          dari HP. Mudah dan cepat di <strong>{appConfig.name}</strong>.
        </p>
      </section>

      {/* Sports Grid */}
      <section>
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Pilih Olahraga
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {mockSports.map((sport) => (
            <Link
              key={sport.id}
              href={`/booking/${sport.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:border-slate-400 hover:shadow-md"
            >
              <div
                className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
                  sportColor[sport.slug] ?? "bg-slate-100 text-slate-600"
                } transition group-hover:scale-110`}
              >
                {sportEmoji[sport.slug] ?? "🏅"}
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {sport.name}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
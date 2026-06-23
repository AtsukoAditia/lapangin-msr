import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-slate-900 p-6 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Lapangin
          </p>
          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            Booking lapangan olahraga lebih cepat, rapi, dan mobile friendly.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Pilih olahraga, cek slot kosong, booking jadwal, dan kelola semuanya
            dari dashboard admin.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-semibold text-slate-950"
            >
              Mulai Booking
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-white/20 px-5 py-3 text-center font-semibold"
            >
              Buka Admin
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Futsal",
            "Minisoccer",
            "Badminton",
            "Padel",
            "Tenis",
            "Basket",
          ].map((sport) => (
            <div
              key={sport}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{sport}</h2>
              <p className="mt-2 text-sm text-slate-500">
                Cek jadwal kosong dan booking lapangan {sport.toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

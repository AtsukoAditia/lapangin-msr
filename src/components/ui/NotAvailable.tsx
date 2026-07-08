import Link from "next/link";

type Props = {
  title: string;
  description: string;
  icon?: string;
  backHref?: string;
  backLabel?: string;
};

export default function NotAvailable({
  title,
  description,
  icon = "🏟️",
  backHref = "/",
  backLabel = "Kembali ke Beranda",
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-white">
        <div className="mx-auto max-w-4xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <nav className="mb-5 text-sm text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
          </nav>
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

      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm sm:p-14">
          <span className="mb-4 inline-block text-6xl">{icon}</span>
          <h1 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-slate-500">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
            >
              ← {backLabel}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
            >
              🏟️ Lihat Semua Olahraga
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
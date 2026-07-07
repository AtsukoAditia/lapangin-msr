import Link from "next/link";
import { mockSports, mockVenues, mockCourts } from "@/lib/mock-data";
import { sportEmoji } from "@/lib/sport-icons";

export default function HomePage() {
  const venueCount = mockVenues.length;
  const courtCount = mockCourts.length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute top-1/2 -left-10 h-60 w-60 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-white/10" />
          {/* Sport field lines */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="100" y2="70" stroke="currentColor" strokeWidth="0.3" className="text-white/20" />
            <line x1="0" y1="50" x2="100" y2="90" stroke="currentColor" strokeWidth="0.2" className="text-white/15" />
            <line x1="0" y1="70" x2="100" y2="20" stroke="currentColor" strokeWidth="0.3" className="text-white/15" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white/10" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 md:py-36">
          <div className="text-center">
            {/* Sport icon cluster */}
            <div className="mb-6 flex items-center justify-center gap-3 text-4xl sm:text-5xl md:text-6xl">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>⚽</span>
              <span className="animate-bounce" style={{ animationDelay: '100ms' }}>🏸</span>
              <span className="animate-bounce" style={{ animationDelay: '200ms' }}>🎾</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🏀</span>
              <span className="animate-bounce" style={{ animationDelay: '400ms' }}>🏓</span>
            </div>

            <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Lapang
              <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">in</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-emerald-100 sm:text-xl md:text-2xl leading-relaxed">
              Booking lapangan olahraga jadi mudah, cepat, dan praktis.
              <br className="hidden sm:block" />
              Pilih venue, pilih waktu, langsung main! 🎯
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/booking"
                className="group inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-emerald-700 shadow-2xl transition-all hover:bg-yellow-300 hover:text-emerald-800 hover:shadow-3xl hover:scale-105"
              >
                🏟️ Booking Sekarang
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="#sports"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/30 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:border-white hover:bg-white/10 hover:scale-105"
              >
                Lihat Olahraga ↓
              </a>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 sm:gap-10 max-w-xl mx-auto">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-4">
                <div className="text-3xl font-black text-yellow-300 sm:text-4xl">{mockSports.length}+</div>
                <div className="mt-1 text-xs text-emerald-200 sm:text-sm font-medium">Jenis Olahraga</div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-4">
                <div className="text-3xl font-black text-yellow-300 sm:text-4xl">{venueCount}</div>
                <div className="mt-1 text-xs text-emerald-200 sm:text-sm font-medium">Venue</div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-4">
                <div className="text-3xl font-black text-yellow-300 sm:text-4xl">{courtCount}</div>
                <div className="mt-1 text-xs text-emerald-200 sm:text-sm font-medium">Lapangan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 10 480 0 720 15C960 30 1200 50 1440 40V80H0Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* Sports Section */}
      <section id="sports" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 text-center sm:mb-14">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-5 py-1.5 text-xs font-bold text-emerald-700 tracking-wide uppercase">
            Pilih Olahraga
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Olahraga yang Tersedia
          </h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">
            Pilih jenis olahraga favoritmu dan temukan lapangan terbaik di kotamu.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 sm:gap-6">
          {mockSports.map((sport) => (
            <Link
              key={sport.id}
              href={`/explore/${sport.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-emerald-400 hover:shadow-xl hover:-translate-y-2 hover:shadow-emerald-100"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 transition group-hover:opacity-100" />
              <div className="mb-3 text-5xl sm:text-6xl group-hover:scale-110 transition-transform duration-300">
                {sportEmoji[sport.slug] || "🏟️"}
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 sm:text-base transition-colors">
                {sport.name}
              </h3>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Booking →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-10 text-center sm:mb-14">
            <span className="mb-3 inline-block rounded-full bg-emerald-100 px-5 py-1.5 text-xs font-bold text-emerald-700 tracking-wide uppercase">
              Mudah & Cepat
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Cara Booking
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Hanya 4 langkah mudah untuk booking lapangan favoritmu
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", icon: "🔍", title: "Pilih Olahraga", desc: "Pilih jenis olahraga yang ingin dimainkan dari 6+ pilihan.", color: "from-emerald-500 to-emerald-600" },
              { step: "2", icon: "🏟️", title: "Pilih Venue & Lapangan", desc: "Lihat venue terdekat dan lapangan yang tersedia.", color: "from-teal-500 to-teal-600" },
              { step: "3", icon: "📅", title: "Pilih Jadwal", desc: "Pilih tanggal dan jam yang kamu inginkan, real-time!", color: "from-cyan-500 to-cyan-600" },
              { step: "4", icon: "✅", title: "Bayar & Main!", desc: "Isi data, bayar, dan lapangan siap dipakai. Gampang!", color: "from-amber-500 to-amber-600" },
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-sm font-bold text-white shadow-lg`}>
                  {item.step}
                </div>
                <div className="mb-3 mt-4 text-4xl group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="mb-2 font-bold text-slate-900 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Points Section */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-1">
            <div className="rounded-3xl bg-white p-8 sm:p-12">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700 tracking-wide uppercase mb-4">
                    🎁 Program Loyalty
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 sm:text-4xl mb-4">
                    Kumpulkan Poin,
                    <br />
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                      Dapatkan Reward!
                    </span>
                  </h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Daftar sekarang dan nikmati program loyalty Lapangin!
                    Setiap transaksi booking lapangan akan mendapatkan poin
                    yang bisa ditukarkan untuk diskon, bonus jam, bahkan
                    lapangan gratis! 🎉
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                    >
                      ✨ Daftar Gratis
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-8 py-3.5 text-base font-semibold text-slate-700 transition-all hover:border-emerald-400 hover:text-emerald-700"
                    >
                      Masuk →
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { emoji: "🏆", title: "Bronze", desc: "1x Poin", sub: "Member Baru" },
                    { emoji: "🥈", title: "Silver", desc: "1.5x Poin", sub: "Spent 500rb+" },
                    { emoji: "🥇", title: "Gold", desc: "2x Poin", sub: "Spent 2jt+" },
                    { emoji: "💎", title: "Diamond", desc: "3x Poin", sub: "Spent 5jt+" },
                  ].map((tier) => (
                    <div key={tier.title} className="rounded-2xl border border-slate-100 p-4 text-center hover:shadow-md transition-all hover:-translate-y-1">
                      <div className="text-3xl mb-2">{tier.emoji}</div>
                      <div className="font-bold text-slate-900">{tier.title}</div>
                      <div className="text-sm font-semibold text-amber-600">{tier.desc}</div>
                      <div className="text-xs text-slate-400 mt-1">{tier.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="80" cy="20" r="20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white/10" />
            <circle cx="20" cy="80" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-white/10" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Siap Bermain? 🏆
          </h2>
          <p className="mt-4 text-emerald-100 text-lg max-w-lg mx-auto">
            Booking sekarang dan rasakan kemudahan Lapangin. Kumpulkan poin untuk reward eksklusif!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-lg font-bold text-emerald-700 shadow-2xl transition-all hover:bg-yellow-300 hover:text-emerald-800 hover:scale-105"
            >
              🏟️ Mulai Booking
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-10 py-4 text-lg font-semibold text-white transition-all hover:border-white hover:bg-white/10"
            >
              🎁 Daftar & Kumpulkan Poin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
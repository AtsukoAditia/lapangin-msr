import { getDatabaseAdapter } from "@/lib/adapters";
import { sportEmoji } from "@/lib/sport-icons";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const adapter = getDatabaseAdapter();
  const sports = await adapter.getSports();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
              Platform Booking Lapangan #1
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Booking Lapangan
              <br />
              <span className="text-emerald-200">Jadi Mudah</span> ⚡
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Futsal, Mini Soccer, Badminton, Padel, Tennis, Basket — semua bisa dipesan dalam hitungan detik. Tanpa ribet, tanpa telepon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking/futsal"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold text-lg rounded-2xl hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                🏟️ Booking Sekarang
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all"
              >
                ✨ Daftar & Dapat Poin
              </Link>
            </div>
          </div>
        </div>
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 50 1440 40V80H0V40Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900">6+</div>
              <div className="text-sm text-gray-500 mt-1">Jenis Olahraga</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900">10+</div>
              <div className="text-sm text-gray-500 mt-1">Lapangan Tersedia</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900">24/7</div>
              <div className="text-sm text-gray-500 mt-1">Booking Online</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-500">⭐ Poin</div>
              <div className="text-sm text-gray-500 mt-1">Reward Setiap Transaksi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Pilih Olahraga Favoritmu 🏆
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              Temukan lapangan yang tersedia dan booking langsung. Cepat, mudah, dan pasti dapat tempat.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {sports.map((sport) => (
              <Link
                key={sport.id}
                href={`/booking/${sport.id}`}
                className="group relative bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
              >
                <div className="text-5xl sm:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {sportEmoji[sport.id] || sportEmoji[sport.name.toLowerCase()] || "🏅"}
                </div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{sport.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Lihat Lapangan →</p>
                <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500 ring-opacity-0 group-hover:ring-opacity-100 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Cara Booking 📱
            </h2>
            <p className="text-gray-600 text-lg">Hanya 3 langkah simpel</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "1", icon: "🔍", title: "Pilih Lapangan", desc: "Pilih olahraga, venue, dan lapangan yang kamu inginkan" },
              { step: "2", icon: "📅", title: "Pilih Jadwal", desc: "Tentukan tanggal dan jam yang tersedia sesuai keinginanmu" },
              { step: "3", icon: "✅", title: "Konfirmasi & Bayar", desc: "Isi data diri, bayar, dan dapatkan konfirmasi booking" },
            ].map((item) => (
              <div key={item.step} className="relative text-center p-8 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="text-5xl mb-4 mt-2">{item.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Promo */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-6xl mb-6">⭐</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Kumpulin Poin, Dapetin Bonus!
          </h2>
          <p className="text-amber-100 text-lg mb-8 max-w-xl mx-auto">
            Setiap transaksi booking menghasilkan poin yang bisa ditukar untuk potongan harga, bonus jam, bahkan gratis lapangan!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-bold text-lg rounded-2xl hover:bg-amber-50 transition-all shadow-xl"
          >
            🎯 Daftar Gratis & Mulai Kumpulin Poin
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Siap Main? Booking Sekarang! 🚀
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Jangan sampai kehabisan slot. Booking lapangan favoritmu sekarang juga.
          </p>
          <Link
            href="/booking/futsal"
            className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white font-bold text-lg rounded-2xl hover:bg-emerald-500 transition-all shadow-xl"
          >
            🏟️ Mulai Booking
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <span className="text-lg font-black text-white">
                Arena<span className="text-emerald-400">Book</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ArenaBook. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
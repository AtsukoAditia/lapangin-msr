import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Kelola booking, lapangan, harga, dan pengaturan venue.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Booking Hari Ini", "0"],
            ["Pending", "0"],
            ["Confirmed", "0"],
            ["Omzet Hari Ini", "Rp0"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link className="rounded-xl bg-white p-5 font-semibold shadow-sm" href="/admin/bookings">
            Manajemen Booking
          </Link>
          <Link className="rounded-xl bg-white p-5 font-semibold shadow-sm" href="/admin/courts">
            Manajemen Lapangan
          </Link>
          <Link className="rounded-xl bg-white p-5 font-semibold shadow-sm" href="/admin/pricing">
            Manajemen Harga
          </Link>
        </div>
      </section>
    </main>
  );
}

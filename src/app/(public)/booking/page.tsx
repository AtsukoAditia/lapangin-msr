export default function BookingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Booking Lapangan</h1>
        <p className="mt-2 text-slate-500">
          Halaman ini akan dihubungkan ke BookingService dan AvailabilityService.
        </p>

        <div className="mt-6 grid gap-3">
          {["18:00", "19:00", "20:00", "21:00"].map((time) => (
            <button
              key={time}
              className="rounded-xl border p-4 text-left font-semibold hover:bg-slate-50"
            >
              {time} - tersedia
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

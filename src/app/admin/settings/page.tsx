"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Pengaturan</h1>

      {saved && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          ✅ Pengaturan berhasil disimpan (demo)
        </div>
      )}

      <div className="space-y-6">
        {/* App Info */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Informasi Aplikasi
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Nama Aplikasi
              </label>
              <input
                type="text"
                defaultValue="Lapangin"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                URL Aplikasi
              </label>
              <input
                type="text"
                defaultValue="https://lapangin.vercel.app"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Operating Hours */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Jam Operasional
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Jam Buka
              </label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Jam Tutup
              </label>
              <input
                type="time"
                defaultValue="22:00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Database */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Database
          </h2>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600">
              Provider: <span className="font-mono font-medium">mock</span>
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ubah DATABASE_PROVIDER di .env.local untuk beralih ke Google Sheets
            atau PostgreSQL
          </p>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-red-700">
            Danger Zone
          </h2>
          <p className="mb-3 text-sm text-red-600">
            Aksi di bawah ini tidak dapat dibatalkan.
          </p>
          <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            🗑️ Reset Semua Data (Demo)
          </button>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            💾 Simpan Pengaturan
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
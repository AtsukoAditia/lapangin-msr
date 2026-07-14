"use client";

import { useState } from "react";
import Link from "next/link";

export default function NotificationPreferencesPage() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [waEnabled, setWaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      localStorage.setItem("notification_preferences", JSON.stringify({ pushEnabled, emailEnabled, waEnabled }));
      setMessage("Pengaturan berhasil disimpan!");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <Link href="/profile" className="text-emerald-600 text-sm hover:underline">← Profil</Link>
          <h1 className="text-lg font-bold mt-1">🔔 Pengaturan Notifikasi</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("berhasil") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">📱 Push Notifications</p>
                <p className="text-sm text-gray-500">Notifikasi langsung ke browser</p>
              </div>
              <button onClick={() => setPushEnabled(!pushEnabled)} className={`relative w-12 h-6 rounded-full transition-colors ${pushEnabled ? "bg-emerald-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${pushEnabled ? "translate-x-6" : ""}`} />
              </button>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">📧 Email</p>
                <p className="text-sm text-gray-500">Konfirmasi booking via email</p>
              </div>
              <button onClick={() => setEmailEnabled(!emailEnabled)} className={`relative w-12 h-6 rounded-full transition-colors ${emailEnabled ? "bg-emerald-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailEnabled ? "translate-x-6" : ""}`} />
              </button>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">💬 WhatsApp</p>
                <p className="text-sm text-gray-500">Notifikasi via WhatsApp</p>
              </div>
              <button onClick={() => setWaEnabled(!waEnabled)} className={`relative w-12 h-6 rounded-full transition-colors ${waEnabled ? "bg-emerald-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${waEnabled ? "translate-x-6" : ""}`} />
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full mt-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>
    </div>
  );
}

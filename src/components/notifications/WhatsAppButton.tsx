"use client";

import { useState } from "react";

interface WhatsAppButtonProps {
  bookingId: string;
  phone?: string;
  type?: "confirm" | "reminder" | "rating";
  label?: string;
  className?: string;
}

export default function WhatsAppButton({
  bookingId,
  phone,
  type = "confirm",
  label = "📱 Kirim WhatsApp",
  className = "",
}: WhatsAppButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/notifications/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, type, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim notifikasi");
      }

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }

      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <span className={`text-sm text-green-600 font-medium ${className}`}>
        ✅ Terkirim
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition disabled:opacity-50 ${className}`}
      >
        {loading ? "Mengirim..." : label}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

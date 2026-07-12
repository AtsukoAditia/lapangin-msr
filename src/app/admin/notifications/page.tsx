"use client";

import { useEffect, useState } from "react";
import type { NotificationLog } from "@/lib/types/domain";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (!cancelled) {
          if (data.success) {
            setNotifications(data.data);
          } else {
            setError(data.error || "Gagal memuat notifikasi");
          }
        }
      } catch {
        if (!cancelled) setError("Gagal memuat notifikasi");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMarkRead(id: string) {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? data.data : n)),
        );
      }
    } catch {
      // silent fail
    }
  }

  function getStatusBadge(status: NotificationLog["status"]) {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      read: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
      >
        {status}
      </span>
    );
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      booking_created: "Booking Dibuat",
      booking_confirmed: "Booking Dikonfirmasi",
      booking_rejected: "Booking Ditolak",
      booking_cancelled: "Booking Dibatalkan",
      payment_received: "Pembayaran Diterima",
      payment_confirmed: "Pembayaran Dikonfirmasi",
      payment_rejected: "Pembayaran Ditolak",
      reminder_before_booking: "Pengingat Booking",
      admin_new_booking: "Booking Baru (Admin)",
      admin_payment_proof: "Bukti Bayar (Admin)",
    };
    return labels[type] || type;
  }

  function getChannelIcon(channel: string) {
    switch (channel) {
      case "email":
        return "📧";
      case "whatsapp":
        return "💬";
      case "sms":
        return "📱";
      case "in_app":
        return "🔔";
      case "web_push":
        return "🔔";
      default:
        return "📩";
    }
  }

  function formatDateTime(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  const unreadCount = notifications.filter(
    (n) => n.status === "sent" && !n.readAt,
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Log semua notifikasi yang dikirim sistem
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            {unreadCount} belum dibaca
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="mb-1 text-lg font-medium text-gray-900">
            Belum ada notifikasi
          </p>
          <p className="text-sm text-gray-500">
            Notifikasi akan muncul ketika ada aktivitas booking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                notif.readAt
                  ? "border-gray-200 opacity-70"
                  : "border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl">
                    {getChannelIcon(notif.channel)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {notif.subject || getTypeLabel(notif.type)}
                      </span>
                      {getStatusBadge(notif.status)}
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                        {getTypeLabel(notif.type)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm whitespace-pre-line text-gray-600 line-clamp-3">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span>Kepada: {notif.recipient}</span>
                      {notif.bookingCode && (
                        <span>Booking: {notif.bookingCode}</span>
                      )}
                      <span>{formatDateTime(notif.createdAt)}</span>
                    </div>
                    {notif.errorMessage && (
                      <p className="mt-1 text-xs text-red-500">
                        Error: {notif.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
                {!notif.readAt && notif.status === "sent" && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
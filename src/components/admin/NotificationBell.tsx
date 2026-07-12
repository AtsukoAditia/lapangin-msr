"use client";

import { useEffect, useState, useRef } from "react";
import type { NotificationLog } from "@/lib/types/domain";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (n) => n.status === "sent" && !n.readAt,
  ).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Fetch on open
  useEffect(() => {
    if (!open || notifications.length > 0) return;
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state for async fetch
    setLoading(true);
    fetch("/api/admin/notifications", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifications(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [open, notifications.length]);

  // Poll unread count every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/notifications")
        .then((r) => r.json())
        .then((d) => { if (d.success) setNotifications(d.data); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
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
    } catch { /* silent */ }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => n.status === "sent" && !n.readAt);
    await Promise.all(
      unread.map((n) =>
        fetch("/api/admin/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        })
      )
    );
    setNotifications((prev) =>
      prev.map((n) =>
        n.status === "sent" && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n
      )
    );
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      booking_created: "Booking Dibuat",
      booking_confirmed: "Dikonfirmasi",
      booking_rejected: "Ditolak",
      payment_received: "Pembayaran Diterima",
      payment_confirmed: "Pembayaran Dikonfirmasi",
      admin_new_booking: "Booking Baru",
      admin_payment_proof: "Bukti Bayar",
    };
    return labels[type] || type;
  }

  // eslint-disable-next-line react-hooks/purity -- display-only timestamp
  function timeAgo(dateStr: string, now = Date.now()) {
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j`;
    return `${Math.floor(hours / 24)}h`;
  }

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Notifikasi"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-gray-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-500">Belum ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.slice(0, 20).map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 transition-colors hover:bg-gray-50 cursor-pointer ${
                      !notif.readAt && notif.status === "sent" ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => {
                      if (!notif.readAt && notif.status === "sent") handleMarkRead(notif.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Unread dot */}
                      <div className="mt-1.5 shrink-0">
                        {!notif.readAt && notif.status === "sent" ? (
                          <div className="w-2 h-2 rounded-full bg-primary-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {notif.subject || getTypeLabel(notif.type)}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                          {notif.bookingCode && (
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {notif.bookingCode}
                            </span>
                          )}
                          <span>{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <a
                href="/admin/notifications"
                className="block text-center text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
                onClick={() => setOpen(false)}
              >
                Lihat Semua Notifikasi →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

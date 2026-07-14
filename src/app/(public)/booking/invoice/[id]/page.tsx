"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface InvoiceData {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  venueName: string;
  venueAddress?: string;
  venuePhone?: string;
  courtName: string;
  sportName: string;
  pricing: {
    basePricePerHour: number;
    hours: number;
    baseTotal: number;
    discount: number;
    total: number;
  };
  bookingStatus: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(p: number) {
  return `Rp ${p?.toLocaleString("id-ID")}`;
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    waiting_payment: "Menunggu Bayar",
    waiting_verification: "Verifikasi",
    cancelled: "Dibatalkan",
    rejected: "Ditolak",
    expired: "Kedaluwarsa",
    no_show: "No Show",
    pending: "Pending",
    paid: "Lunas",
    unpaid: "Belum Bayar",
    waiting_confirmation: "Menunggu Konfirmasi",
    dp_paid: "DP Dibayar",
    refunded: "Dikembalikan",
  };
  return map[s] ?? s;
}

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/${params.id}/invoice`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Gagal memuat invoice."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-gray-600">{error || "Invoice tidak ditemukan."}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .invoice-box { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Top bar - hidden on print */}
        <div className="no-print bg-white border-b px-6 py-4 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-emerald-600 text-sm hover:underline"
            >
              ← Kembali
            </button>
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              🖨️ Cetak Invoice
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="invoice-box bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">⚽ Lapangin</h1>
                  <p className="text-emerald-100 text-sm mt-1">Invoice Pembayaran</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-100">No. Invoice</p>
                  <p className="font-mono text-sm font-bold">{data.bookingCode}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* From / To */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Dari</p>
                  <p className="font-semibold text-gray-900">{data.venueName}</p>
                  {data.venueAddress && <p className="text-sm text-gray-600">{data.venueAddress}</p>}
                  {data.venuePhone && <p className="text-sm text-gray-600">{data.venuePhone}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Untuk</p>
                  <p className="font-semibold text-gray-900">{data.customerName}</p>
                  <p className="text-sm text-gray-600">{data.customerPhone}</p>
                  {data.customerEmail && <p className="text-sm text-gray-600">{data.customerEmail}</p>}
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Detail Booking</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lapangan</span>
                    <span className="font-medium">{data.courtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Olahraga</span>
                    <span className="font-medium">{data.sportName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal</span>
                    <span className="font-medium">{formatDate(data.bookingDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jam</span>
                    <span className="font-medium">{data.startTime?.slice(0, 5)} – {data.endTime?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Durasi</span>
                    <span className="font-medium">{data.durationMinutes} menit</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Rincian Biaya</p>
                <div className="border rounded-xl divide-y text-sm">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-600">{data.courtName} × {data.pricing.hours} jam</span>
                    <span className="font-medium">{formatPrice(data.pricing.basePricePerHour)} / jam</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(data.pricing.baseTotal)}</span>
                  </div>
                  {data.pricing.discount !== 0 && (
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-gray-600">{data.pricing.discount > 0 ? "Diskon" : "Surcharge"}</span>
                      <span className={`font-medium ${data.pricing.discount > 0 ? "text-blue-600" : "text-amber-600"}`}>
                        {data.pricing.discount > 0 ? "-" : "+"}{formatPrice(Math.abs(data.pricing.discount))}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-3 bg-emerald-50">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-lg font-extrabold text-emerald-600">{formatPrice(data.pricing.total)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Status Booking</p>
                  <p className="font-semibold text-gray-900">{statusLabel(data.bookingStatus)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Status Pembayaran</p>
                  <p className="font-semibold text-gray-900">{statusLabel(data.paymentStatus)}</p>
                </div>
              </div>

              {/* Footer info */}
              <div className="text-xs text-gray-400 text-center pt-4 border-t">
                <p>Dibuat: {new Date(data.createdAt).toLocaleString("id-ID")}</p>
                {data.paidAt && <p>Dibayar: {new Date(data.paidAt).toLocaleString("id-ID")}</p>}
                <p className="mt-2">Terima kasih telah menggunakan Lapangin!</p>
                <p>lapangin.id</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="mt-4 bg-white rounded-xl border p-4 text-sm">
              <p className="text-xs text-gray-400 mb-1">Catatan</p>
              <p className="text-gray-700">{data.notes}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  customerName?: string;
  venueName?: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(id: string, isVisible: boolean) {
    setToggling(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isVisible } : r))
        );
      }
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          ⭐ Moderasi Ulasan
        </h1>
        <p className="mt-1 text-sm text-orange-100">
          {reviews.length} total ulasan · {reviews.filter((r) => !r.isVisible).length} disembunyikan
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-lg font-bold text-slate-700">Belum ada ulasan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                !review.isVisible ? "border-red-200 bg-red-50/30" : ""
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`h-4 w-4 ${s <= review.rating ? "text-amber-400" : "text-slate-200"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {!review.isVisible && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                          Tersembunyi
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500">
                      {review.customerName || "Anonim"} · {review.venueName || "-"} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(review.id, !review.isVisible)}
                    disabled={toggling === review.id}
                    className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition ${
                      review.isVisible
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    } disabled:opacity-50`}
                  >
                    {toggling === review.id
                      ? "..."
                      : review.isVisible
                        ? "Sembunyikan"
                        : "Tampilkan"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

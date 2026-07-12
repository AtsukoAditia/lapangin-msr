"use client";

import { useState } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  bookingId: string;
  venueId: string;
  courtId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ bookingId, venueId, courtId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, _setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Pilih rating bintang dulu");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          venueId,
          courtId,
          rating,
          comment,
          photos,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim review");
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim review");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-lg font-semibold text-green-800 mb-1">Review Terkirim!</h3>
        <p className="text-green-600">Terima kasih atas review kamu.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Beri Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Komentar</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalaman kamu..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length}/1000</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Mengirim..." : "Kirim Review"}
      </button>
    </form>
  );
}
